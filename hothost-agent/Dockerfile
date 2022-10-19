FROM ubuntu as psbuilder
RUN apt-get update -y && apt-get -y install build-essential gettext autoconf pkg-config \
  gcc make git autopoint libtool libtool-bin
RUN git clone https://gitlab.com/procps-ng/procps.git
WORKDIR /procps
RUN git checkout v3.3.17 && find . \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i 's|"/proc|"/host/proc|g' &&\
find . \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i 's|void look_up_our_self(proc_t \*p) {|void look_up_our_self(proc_t *p) {return 1; }; int a12(proc_t *p) { |g' &&\
./autogen.sh &&\
LDFLAGS=-static ./configure --without-ncurses

RUN make

FROM ubuntu
COPY --from=psbuilder /procps/ps/pscommand /pscommand

RUN apt-get update -y && apt-get -y install curl
ADD getinfo.sh .

CMD [ "bash", "getinfo.sh" ]