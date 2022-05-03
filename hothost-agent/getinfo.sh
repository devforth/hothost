#!/usr/bin/env sh

# -------------------------------------------------------------------------------------------------
# detect the kernel

KERNEL_NAME="$(uname -s)"
KERNEL_VERSION="$(uname -r)"
ARCHITECTURE="$(uname -m)"

HOST_PUBLIC_IP=`curl ifconfig.me`

# -------------------------------------------------------------------------------------------------
# detect the virtualization and possibly the container technology

CONTAINER="unknown"
CONT_DETECTION="none"
CONTAINER_IS_OFFICIAL_IMAGE="${OFFICIAL_IMAGE:-false}"

if [ -z "${VIRTUALIZATION}" ]; then
  VIRTUALIZATION="unknown"
  VIRT_DETECTION="none"

  if [ -n "$(command -v systemd-detect-virt 2> /dev/null)" ]; then
    VIRTUALIZATION="$(systemd-detect-virt -v)"
    VIRT_DETECTION="systemd-detect-virt"
    CONTAINER=${CONTAINER:-$(systemd-detect-virt -c)}
    CONT_DETECTION="systemd-detect-virt"
  else
    if grep -q "^flags.*hypervisor" /proc/cpuinfo 2> /dev/null; then
      VIRTUALIZATION="hypervisor"
      VIRT_DETECTION="/proc/cpuinfo"
    elif [ -n "$(command -v dmidecode)" ] && dmidecode -s system-product-name 2> /dev/null | grep -q "VMware\|Virtual\|KVM\|Bochs"; then
      VIRTUALIZATION="$(dmidecode -s system-product-name)"
      VIRT_DETECTION="dmidecode"
    else
      VIRTUALIZATION="none"
    fi
  fi
  if [ -z "${VIRTUALIZATION}" ]; then
    # Output from the command is outside of spec
    VIRTUALIZATION="unknown"
  fi
else
  # Passed from outside - probably in docker run
  VIRT_DETECTION="provided"
fi

# -------------------------------------------------------------------------------------------------
# detect containers with heuristics

if [ "${CONTAINER}" = "unknown" ]; then
  if [ -f /proc/1/sched ]; then
    IFS='(, ' read -r process _ < /proc/1/sched
    if [ "${process}" = "netdata" ]; then
      CONTAINER="container"
      CONT_DETECTION="process"
    fi
  fi
  # ubuntu and debian supply /bin/running-in-container
  # https://www.apt-browse.org/browse/ubuntu/trusty/main/i386/upstart/1.12.1-0ubuntu4/file/bin/running-in-container
  if /bin/running-in-container > /dev/null 2>&1; then
    CONTAINER="container"
    CONT_DETECTION="/bin/running-in-container"
  fi

  # lxc sets environment variable 'container'
  #shellcheck disable=SC2154
  if [ -n "${container}" ]; then
    CONTAINER="lxc"
    CONT_DETECTION="containerenv"
  fi

  # docker creates /.dockerenv
  # http://stackoverflow.com/a/25518345
  if [ -f "/.dockerenv" ]; then
    CONTAINER="docker"
    CONT_DETECTION="dockerenv"
  fi

fi

# -------------------------------------------------------------------------------------------------
# detect the operating system

# Initially assume all OS detection values are for a container, these are moved later if we are bare-metal

CONTAINER_OS_DETECTION="unknown"
CONTAINER_NAME="unknown"
CONTAINER_VERSION="unknown"
CONTAINER_VERSION_ID="unknown"
CONTAINER_ID="unknown"
CONTAINER_ID_LIKE="unknown"

if [ "${KERNEL_NAME}" = "Darwin" ]; then
  CONTAINER_ID=$(sw_vers -productName)
  CONTAINER_ID_LIKE="mac"
  CONTAINER_NAME="mac"
  CONTAINER_VERSION=$(sw_vers -productVersion)
  CONTAINER_OS_DETECTION="sw_vers"
elif [ "${KERNEL_NAME}" = "FreeBSD" ]; then
  CONTAINER_ID="FreeBSD"
  CONTAINER_ID_LIKE="FreeBSD"
  CONTAINER_NAME="FreeBSD"
  CONTAINER_OS_DETECTION="uname"
  CONTAINER_VERSION=$(uname -r)
  KERNEL_VERSION=$(uname -K)
else
  if [ -f "/etc/os-release" ]; then
    eval "$(grep -E "^(NAME|ID|ID_LIKE|VERSION|VERSION_ID)=" < /etc/os-release | sed 's/^/CONTAINER_/')"
    CONTAINER_OS_DETECTION="/etc/os-release"
  fi

  # shellcheck disable=SC2153
  if [ "${CONTAINER_NAME}" = "unknown" ] || [ "${CONTAINER_VERSION}" = "unknown" ] || [ "${CONTAINER_ID}" = "unknown" ]; then
    if [ -f "/etc/lsb-release" ]; then
      if [ "${CONTAINER_OS_DETECTION}" = "unknown" ]; then
        CONTAINER_OS_DETECTION="/etc/lsb-release"
      else
        CONTAINER_OS_DETECTION="Mixed"
      fi
      DISTRIB_ID="unknown"
      DISTRIB_RELEASE="unknown"
      DISTRIB_CODENAME="unknown"
      eval "$(grep -E "^(DISTRIB_ID|DISTRIB_RELEASE|DISTRIB_CODENAME)=" < /etc/lsb-release)"
      if [ "${CONTAINER_NAME}" = "unknown" ]; then CONTAINER_NAME="${DISTRIB_ID}"; fi
      if [ "${CONTAINER_VERSION}" = "unknown" ]; then CONTAINER_VERSION="${DISTRIB_RELEASE}"; fi
      if [ "${CONTAINER_ID}" = "unknown" ]; then CONTAINER_ID="${DISTRIB_CODENAME}"; fi
    fi
    if [ -n "$(command -v lsb_release 2> /dev/null)" ]; then
      if [ "${CONTAINER_OS_DETECTION}" = "unknown" ]; then
        CONTAINER_OS_DETECTION="lsb_release"
      else
        CONTAINER_OS_DETECTION="Mixed"
      fi
      if [ "${CONTAINER_NAME}" = "unknown" ]; then CONTAINER_NAME="$(lsb_release -is 2> /dev/null)"; fi
      if [ "${CONTAINER_VERSION}" = "unknown" ]; then CONTAINER_VERSION="$(lsb_release -rs 2> /dev/null)"; fi
      if [ "${CONTAINER_ID}" = "unknown" ]; then CONTAINER_ID="$(lsb_release -cs 2> /dev/null)"; fi
    fi
  fi
fi

# If Netdata is not running in a container then use the local detection as the host
HOST_OS_DETECTION="unknown"
HOST_NAME="unknown"
HOST_VERSION="unknown"
HOST_VERSION_ID="unknown"
HOST_ID="unknown"
HOST_ID_LIKE="unknown"

# 'systemd-detect-virt' returns 'none' if there is no hardware/container virtualization.
if [ "${CONTAINER}" = "unknown" ] || [ "${CONTAINER}" = "none" ]; then
  for v in NAME ID ID_LIKE VERSION VERSION_ID OS_DETECTION; do
    eval "HOST_$v=\$CONTAINER_$v; CONTAINER_$v=none"
  done
else
  # Otherwise try and use a user-supplied bind-mount into the container to resolve the host details
  if [ -e "/host/etc/os-release" ]; then
    eval "$(grep -E "^(NAME|ID|ID_LIKE|VERSION|VERSION_ID)=" < /host/etc/os-release | sed 's/^/HOST_/')"
    HOST_OS_DETECTION="/host/etc/os-release"
  fi
  if [ "${HOST_NAME}" = "unknown" ] || [ "${HOST_VERSION}" = "unknown" ] || [ "${HOST_ID}" = "unknown" ]; then
    if [ -f "/host/etc/lsb-release" ]; then
      if [ "${HOST_OS_DETECTION}" = "unknown" ]; then
        HOST_OS_DETECTION="/etc/lsb-release"
      else
        HOST_OS_DETECTION="Mixed"
      fi
      DISTRIB_ID="unknown"
      DISTRIB_RELEASE="unknown"
      DISTRIB_CODENAME="unknown"
      eval "$(grep -E "^(DISTRIB_ID|DISTRIB_RELEASE|DISTRIB_CODENAME)=" < /etc/lsb-release)"
      if [ "${HOST_NAME}" = "unknown" ]; then HOST_NAME="${DISTRIB_ID}"; fi
      if [ "${HOST_VERSION}" = "unknown" ]; then HOST_VERSION="${DISTRIB_RELEASE}"; fi
      if [ "${HOST_ID}" = "unknown" ]; then HOST_ID="${DISTRIB_CODENAME}"; fi
    fi
  fi
fi

if [ -f "/host/etc/hostname" ]; then
  HOSTNAME=`cat /host/etc/hostname`
else
  HOSTNAME=`cat /etc/hostname`
fi

# -------------------------------------------------------------------------------------------------
# Detect information about the CPU

LCPU_COUNT="unknown"
CPU_MODEL="unknown"
CPU_VENDOR="unknown"
CPU_FREQ="unknown"
CPU_INFO_SOURCE="none"

possible_cpu_freq=""
nproc="$(command -v nproc)"
lscpu="$(command -v lscpu)"
lscpu_output=""
dmidecode="$(command -v dmidecode)"
dmidecode_output=""

if [ -n "${lscpu}" ] && lscpu > /dev/null 2>&1; then
  lscpu_output="$(LC_NUMERIC=C ${lscpu} 2> /dev/null)"
  CPU_INFO_SOURCE="lscpu"
  LCPU_COUNT="$(echo "${lscpu_output}" | grep "^CPU(s):" | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  CPU_VENDOR="$(echo "${lscpu_output}" | grep "^Vendor ID:" | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  CPU_MODEL="$(echo "${lscpu_output}" | grep "^Model name:" | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  possible_cpu_freq="$(echo "${lscpu_output}" | grep -F "CPU max MHz:" | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' | grep -o '^[0-9]*')"
  if [ -z "$possible_cpu_freq" ]; then
    possible_cpu_freq="$(echo "${lscpu_output}" | grep -F "CPU MHz:" | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' | grep -o '^[0-9]*')"
  fi
  if [ -z "$possible_cpu_freq" ]; then
    possible_cpu_freq="$(echo "${lscpu_output}" | grep "^Model name:" | grep -Eo "[0-9\.]+GHz" | grep -o "^[0-9\.]*" | awk '{print int($0*1000)}')"
  fi
  [ -n "$possible_cpu_freq" ] && possible_cpu_freq="${possible_cpu_freq} MHz"
elif [ -n "${dmidecode}" ] && dmidecode -t processor > /dev/null 2>&1; then
  dmidecode_output="$(${dmidecode} -t processor 2> /dev/null)"
  CPU_INFO_SOURCE="dmidecode"
  LCPU_COUNT="$(echo "${dmidecode_output}" | grep -F "Thread Count:" | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  CPU_VENDOR="$(echo "${dmidecode_output}" | grep -F "Manufacturer:" | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  CPU_MODEL="$(echo "${dmidecode_output}" | grep -F "Version:" | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  possible_cpu_freq="$(echo "${dmidecode_output}" | grep -F "Current Speed:" | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
else
  if [ -n "${nproc}" ]; then
    CPU_INFO_SOURCE="nproc"
    LCPU_COUNT="$(${nproc})"
  elif [ "${KERNEL_NAME}" = FreeBSD ]; then
    CPU_INFO_SOURCE="sysctl"
    LCPU_COUNT="$(sysctl -n kern.smp.cpus)"
    if ! possible_cpu_freq=$(sysctl -n machdep.tsc_freq 2> /dev/null); then
      possible_cpu_freq=$(sysctl -n hw.model 2> /dev/null | grep -Eo "[0-9\.]+GHz" | grep -o "^[0-9\.]*" | awk '{print int($0*1000)}')
      [ -n "$possible_cpu_freq" ] && possible_cpu_freq="${possible_cpu_freq} MHz"
    fi
  elif [ "${KERNEL_NAME}" = Darwin ]; then
    CPU_INFO_SOURCE="sysctl"
    LCPU_COUNT="$(sysctl -n hw.logicalcpu)"
  elif [ -d /sys/devices/system/cpu ]; then
    CPU_INFO_SOURCE="sysfs"
    # This is potentially more accurate than checking `/proc/cpuinfo`.
    LCPU_COUNT="$(find /sys/devices/system/cpu -mindepth 1 -maxdepth 1 -type d -name 'cpu*' | grep -cEv 'idle|freq')"
  elif [ -r /proc/cpuinfo ]; then
    CPU_INFO_SOURCE="procfs"
    LCPU_COUNT="$(grep -c ^processor /proc/cpuinfo)"
  fi

  if [ "${KERNEL_NAME}" = Darwin ]; then
    CPU_MODEL="$(sysctl -n machdep.cpu.brand_string)"
    if [ "${ARCHITECTURE}" = "x86_64" ]; then
      CPU_VENDOR="$(sysctl -n machdep.cpu.vendor)"
    else
      CPU_VENDOR="Apple"
    fi
    echo "${CPU_INFO_SOURCE}" | grep -qv sysctl && CPU_INFO_SOURCE="${CPU_INFO_SOURCE} sysctl"
  elif uname --version 2> /dev/null | grep -qF 'GNU coreutils'; then
    CPU_INFO_SOURCE="${CPU_INFO_SOURCE} uname"
    CPU_MODEL="$(uname -p)"
    CPU_VENDOR="$(uname -i)"
  elif [ "${KERNEL_NAME}" = FreeBSD ]; then
    if (echo "${CPU_INFO_SOURCE}" | grep -qv sysctl); then
      CPU_INFO_SOURCE="${CPU_INFO_SOURCE} sysctl"
    fi

    CPU_MODEL="$(sysctl -n hw.model)"
  elif [ -r /proc/cpuinfo ]; then
    if (echo "${CPU_INFO_SOURCE}" | grep -qv procfs); then
      CPU_INFO_SOURCE="${CPU_INFO_SOURCE} procfs"
    fi

    CPU_MODEL="$(grep -F "model name" /proc/cpuinfo | head -n 1 | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
    CPU_VENDOR="$(grep -F "vendor_id" /proc/cpuinfo | head -n 1 | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  fi
fi

if [ "${KERNEL_NAME}" = Darwin ] && [ "${ARCHITECTURE}" = "x86_64" ]; then
  CPU_FREQ="$(sysctl -n hw.cpufrequency)"
elif [ -r /sys/devices/system/cpu/cpu0/cpufreq/base_frequency ]; then
  if (echo "${CPU_INFO_SOURCE}" | grep -qv sysfs); then
    CPU_INFO_SOURCE="${CPU_INFO_SOURCE} sysfs"
  fi

  value="$(cat /sys/devices/system/cpu/cpu0/cpufreq/base_frequency)"
  CPU_FREQ="$((value * 1000))"
elif [ -n "${possible_cpu_freq}" ]; then
  CPU_FREQ="${possible_cpu_freq}"
elif [ -r /sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_max_freq ]; then
  if (echo "${CPU_INFO_SOURCE}" | grep -qv sysfs); then
    CPU_INFO_SOURCE="${CPU_INFO_SOURCE} sysfs"
  fi

  value="$(cat /sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_max_freq)"
  CPU_FREQ="$((value * 1000))"
elif [ -r /proc/cpuinfo ]; then
  if (echo "${CPU_INFO_SOURCE}" | grep -qv procfs); then
    CPU_INFO_SOURCE="${CPU_INFO_SOURCE} procfs"
  fi
  value=$(grep "cpu MHz" /proc/cpuinfo 2>/dev/null | grep -o "[0-9]*" | head -n 1 | awk '{print int($0*1000000)}')
  [ -n "$value" ] && CPU_FREQ="$value"
fi

freq_units="$(echo "${CPU_FREQ}" | cut -f 2 -d ' ')"

case "${freq_units}" in
  GHz)
    value="$(echo "${CPU_FREQ}" | cut -f 1 -d ' ')"
    CPU_FREQ="$((value * 1000 * 1000 * 1000))"
    ;;
  MHz)
    value="$(echo "${CPU_FREQ}" | cut -f 1 -d ' ')"
    CPU_FREQ="$((value * 1000 * 1000))"
    ;;
  KHz)
    value="$(echo "${CPU_FREQ}" | cut -f 1 -d ' ')"
    CPU_FREQ="$((value * 1000))"
    ;;
  *) ;;

esac



# -------------------------------------------------------------------------------------------------
# Detect whether the node is kubernetes node

HOST_IS_K8S_NODE="false"

if [ -n "${KUBERNETES_SERVICE_HOST}" ] && [ -n "${KUBERNETES_SERVICE_PORT}" ]; then
  # These env vars are set for every container managed by k8s.
  HOST_IS_K8S_NODE="true"
elif pgrep "kubelet"; then
  # The kubelet is the primary "node agent" that runs on each node.
  HOST_IS_K8S_NODE="true"
fi

# ------------------------------------------------------------------------------------------------
# Detect instance metadata for VMs running on cloud providers

CLOUD_TYPE="unknown"
CLOUD_INSTANCE_TYPE="unknown"
CLOUD_INSTANCE_REGION="unknown"

# if [ "${VIRTUALIZATION}" != "none" ] && command -v curl > /dev/null 2>&1; then
#   # Try AWS IMDSv2
#   if [ "${CLOUD_TYPE}" = "unknown" ]; then
#     AWS_IMDS_TOKEN="$(curl --fail -s -m 5 --noproxy "*" -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")"
#     if [ -n "${AWS_IMDS_TOKEN}" ]; then
#       CLOUD_TYPE="AWS"
#       CLOUD_INSTANCE_TYPE="$(curl --fail -s -m 5 --noproxy "*" -H "X-aws-ec2-metadata-token: $AWS_IMDS_TOKEN" -v "http://169.254.169.254/latest/meta-data/instance-type" 2> /dev/null)"
#       CLOUD_INSTANCE_REGION="$(curl --fail -s -m 5 --noproxy "*" -H "X-aws-ec2-metadata-token: $AWS_IMDS_TOKEN" -v "http://169.254.169.254/latest/meta-data/placement/region" 2> /dev/null)"
#     fi
#   fi

#   # Try GCE computeMetadata v1
#   if [ "${CLOUD_TYPE}" = "unknown" ]; then
#     if [ -n "$(curl --fail -s -m 5 --noproxy "*" -H "Metadata-Flavor: Google" "http://metadata.google.internal/computeMetadata/v1")" ]; then
#       CLOUD_TYPE="GCP"
#       CLOUD_INSTANCE_TYPE="$(curl --fail -s -m 5 --noproxy "*" -H "Metadata-Flavor: Google" "http://metadata.google.internal/computeMetadata/v1/instance/machine-type")"
#       [ -n "$CLOUD_INSTANCE_TYPE" ] && CLOUD_INSTANCE_TYPE=$(basename "$CLOUD_INSTANCE_TYPE")
#       CLOUD_INSTANCE_REGION="$(curl --fail -s -m 5 --noproxy "*" -H "Metadata-Flavor: Google" "http://metadata.google.internal/computeMetadata/v1/instance/zone")"
#       [ -n "$CLOUD_INSTANCE_REGION" ] && CLOUD_INSTANCE_REGION=$(basename "$CLOUD_INSTANCE_REGION") && CLOUD_INSTANCE_REGION=${CLOUD_INSTANCE_REGION%-*}
#     fi
#   fi

#   # TODO: needs to be tested in Microsoft Azure
#   # Try Azure IMDS
#   # if [ "${CLOUD_TYPE}" = "unknown" ]; then
#   #   AZURE_IMDS_DATA="$(curl --fail -s -m 5 -H "Metadata: true" --noproxy "*" "http://169.254.169.254/metadata/instance?version=2021-10-01")"
#   #   if [ -n "${AZURE_IMDS_DATA}" ]; then
#   #     CLOUD_TYPE="Azure"
#   #     CLOUD_INSTANCE_TYPE="$(curl --fail -s -m 5 -H "Metadata: true" --noproxy "*" "http://169.254.169.254/metadata/instance/compute/vmSize?version=2021-10-01&format=text")"
#   #     CLOUD_INSTANCE_REGION="$(curl --fail -s -m 5 -H "Metadata: true" --noproxy "*" "http://169.254.169.254/metadata/instance/compute/location?version=2021-10-01&format=text")"
#   #   fi
#   # fi
# fi



if [ -z "$HOTHOST_MONITOR_INTERVAL" ]
then
  echo "You did not set HOTHOST_MONITOR_INTERVAL, pulling every 60 seconds"
  HOTHOST_MONITOR_INTERVAL=60
fi

if [ -z "$HOTHOST_AGENT_SECRET" ]
then
  echo "You have to set HOTHOST_AGENT_SECRET to deliver data to hothost server https://github.com/devforth/hothost"
  exit -1
fi

if [ -z "$HOTHOST_SERVER_BASE" ]
then
  echo "You have to set HOTHOST_SERVER_BASE to deliver data to hothost server https://github.com/devforth/hothost"
  exit -1
fi

while :
do

  DISK_USED=`df / | tail -n 1 | tr -s " " " " | cut -d" " -f3`
  DISK_AVAILABLE=`df / | tail -n 1 | tr -s " " " " | cut -d" " -f4`

  DISK_USED=$((DISK_USED * 1024))
  DISK_AVAILABLE=$((DISK_AVAILABLE * 1024))

  # Detect the total system RAM

  TOTAL_RAM="unknown"
  RAM_DETECTION="none"

  if [ "${KERNEL_NAME}" = FreeBSD ]; then
    RAM_DETECTION="sysctl"
    TOTAL_RAM="$(sysctl -n hw.physmem)"
  elif [ "${KERNEL_NAME}" = Darwin ]; then
    RAM_DETECTION="sysctl"
    TOTAL_RAM="$(sysctl -n hw.physmem)"
  elif [ -r /proc/meminfo ]; then
    RAM_DETECTION="procfs"
    TOTAL_RAM="$(grep -F MemTotal /proc/meminfo | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' | cut -f 1 -d ' ')"
    FREE_RAM="$(grep -F MemAvailable /proc/meminfo | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' | cut -f 1 -d ' ')"
    TOTAL_SWAP="$(grep -F SwapTotal /proc/meminfo | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' | cut -f 1 -d ' ')"
    FREE_SWAP="$(grep -F SwapFree /proc/meminfo | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' | cut -f 1 -d ' ')"

    TOTAL_RAM="$((TOTAL_RAM * 1024))"
    FREE_RAM="$((FREE_RAM * 1024))"
    TOTAL_SWAP="$((TOTAL_SWAP * 1024))"
    FREE_SWAP="$((FREE_SWAP * 1024))"
  fi

  JSON_DATA="{
    \"CONTAINER_OS_NAME\":\"${CONTAINER_NAME}\",
\"CONTAINER_OS_ID\": \"${CONTAINER_ID}\",
\"CONTAINER_OS_ID_LIKE\": \"${CONTAINER_ID_LIKE}\",
\"CONTAINER_OS_VERSION\": \"${CONTAINER_VERSION}\",
\"CONTAINER_OS_VERSION_ID\": \"${CONTAINER_VERSION_ID}\",
\"CONTAINER_OS_DETECTION\": \"${CONTAINER_OS_DETECTION}\",
\"CONTAINER_IS_OFFICIAL_IMAGE\": \"${CONTAINER_IS_OFFICIAL_IMAGE}\",
\"HOST_NAME\":\"${HOSTNAME}\",
\"HOST_OS_NAME\":\"${HOST_NAME}\",
\"HOST_OS_ID\":\"${HOST_ID}\",
\"HOST_OS_ID_LIKE\":\"${HOST_ID_LIKE}\" ,
\"HOST_OS_VERSION\":\"${HOST_VERSION}\" ,
\"HOST_OS_VERSION_ID\":\"${HOST_VERSION_ID}\" ,
\"HOST_OS_DETECTION\":\"${HOST_OS_DETECTION}\" ,
\"HOST_IS_K8S_NODE\":\"${HOST_IS_K8S_NODE}\" ,
\"SYSTEM_KERNEL_NAME\":\"${KERNEL_NAME}\" ,
\"SYSTEM_KERNEL_VERSION\":\"${KERNEL_VERSION}\" ,
\"SYSTEM_ARCHITECTURE\":\"${ARCHITECTURE}\" ,
\"SYSTEM_VIRTUALIZATION\":\"${VIRTUALIZATION}\" ,
\"SYSTEM_VIRT_DETECTION\":\"${VIRT_DETECTION}\" ,
\"SYSTEM_CONTAINER\":\"${CONTAINER}\" ,
\"SYSTEM_CONTAINER_DETECTION\":\"${CONT_DETECTION}\" ,
\"SYSTEM_CPU_LOGICAL_CPU_COUNT\":\"${LCPU_COUNT}\" ,
\"SYSTEM_CPU_VENDOR\":\"${CPU_VENDOR}\" ,
\"SYSTEM_CPU_MODEL\":\"${CPU_MODEL}\" ,
\"SYSTEM_CPU_FREQ\":\"${CPU_FREQ}\" ,
\"SYSTEM_CPU_DETECTION\":\"${CPU_INFO_SOURCE}\" ,
\"SYSTEM_TOTAL_RAM\":\"${TOTAL_RAM}\" ,
\"SYSTEM_FREE_RAM\":\"${FREE_RAM}\" ,
\"SYSTEM_TOTAL_SWAP\":\"${TOTAL_SWAP}\" ,
\"SYSTEM_FREE_SWAP\":\"${TOTAL_SWAP}\" ,
\"SYSTEM_RAM_DETECTION\":\"${RAM_DETECTION}\" ,
\"SYSTEM_TOTAL_DISK_SIZE\":\"${DISK_SIZE}\" ,
\"SYSTEM_DISK_DETECTION\":\"${DISK_DETECTION}\" ,
\"INSTANCE_CLOUD_TYPE\":\"${CLOUD_TYPE}\" ,
\"INSTANCE_CLOUD_INSTANCE_TYPE\":\"${CLOUD_INSTANCE_TYPE}\" ,
\"INSTANCE_CLOUD_INSTANCE_REGION\":\"${CLOUD_INSTANCE_REGION}\" ,
\"DISK_USED\":\"${DISK_USED}\" ,
\"DISK_AVAIL\":\"${DISK_AVAILABLE}\" ,
\"HOST_PUBLIC_IP\":\"${HOST_PUBLIC_IP}\"
  }"
 
  echo $JSON_DATA;

  curl -X POST $HOTHOST_SERVER_BASE/api/data/$HOTHOST_AGENT_SECRET \
   -H 'Content-Type: application/json' \
   -d "$JSON_DATA"
  sleep $HOTHOST_MONITOR_INTERVAL
done