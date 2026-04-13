import React, { useRef, useEffect } from "react";
import { Tooltip, Dropdown } from "flowbite-react";
import { useState } from "react";
import { addLabel, deleteHost } from "../../../FetchApi";
import MonitoringRow from "./MonitoringRow";
import DonutChart from "react-donut-chart";
import DonutChartModal from "./DonutChartModal";
import MonitoringModal from "./MonitoringModal/MonitoringModal";
import NotificationModal from "./MonitoringModal/NotificationModal";
import AssignGroupModal from "../HostGroups/AssignGroupModal";

const MonitoringTable = (props) => {
  const monitoringData = props.monitoringData;
  const refreshData = props.refreshData;
  const cookieExist = props.cookieExist

  const [labelModalIsVisible, setlabelModalIsVisible] = useState(false);
  const [notifyModalIsVisible, setNotifyModalIsVisible] = useState(false);
  const [hostSettingsModalIsVisible, setHostSettingsModalIsVisible] = useState(false);
  const [deleteModalIsVisible, setDeleteModalIsVisible] = useState(false);
  const [donutModalIsVisible, setDonutModalIsVisible] = useState(false);
  const [assignGroupModalIsVisible, setAssignGroupModalIsVisible] = useState(false);

  const [chosenHost, setChosenHost] = useState("");

  const saveLabel = async (labelName) => {
    const body = {
      label: labelName,
      id:
        monitoringData &&
        monitoringData.filter((e) => {
          return e.id === chosenHost;
        })[0].id,
    };
    const data = await addLabel(body, "add_label");
    if (data[0].label) {
      setlabelModalIsVisible(false);
      refreshData();
    }
  };

  const deleteHostAction = async () => {
    const body = {
      id:
        monitoringData &&
        monitoringData.filter((e) => {
          return e.id === chosenHost;
        })[0].id,
    };
    const data = await deleteHost(body, "remove_host");
    if (data.status === "successful") {
      setDeleteModalIsVisible(false);
      refreshData();
    }
  };

  useEffect(() => {
    const body = document.querySelector("body");
    if (donutModalIsVisible) {
      body.style.overflowY = "hidden";
    } else {
      body.style.overflowY = "";
    }
  }, [donutModalIsVisible]);

  const visibleHosts = (monitoringData || []).filter((el) => !el.no_data);
  const groupsMap = new Map();
  const ungrouped = [];
  visibleHosts.forEach((host) => {
    if (host.groupId) {
      if (!groupsMap.has(host.groupId)) {
        groupsMap.set(host.groupId, { name: host.groupName || "Unnamed group", hosts: [] });
      }
      groupsMap.get(host.groupId).hosts.push(host);
    } else {
      ungrouped.push(host);
    }
  });
  const groupedSections = Array.from(groupsMap.entries()).sort((a, b) =>
    (a[1].name || "").localeCompare(b[1].name || "")
  );

  const renderRow = (host, index) => (
    <MonitoringRow
      host={host}
      setChosenHost={setChosenHost}
      key={`hst_tbl_row_${host.id}_${index}`}
      setDelModalIsVisible={setDeleteModalIsVisible}
      setlabelModalIsVisible={setlabelModalIsVisible}
      setDonutModalIsVisible={setDonutModalIsVisible}
      setNotifyModalIsVisible={setNotifyModalIsVisible}
      setHostSettingsModalIsVisible={setHostSettingsModalIsVisible}
      setAssignGroupModalIsVisible={setAssignGroupModalIsVisible}
      cookieExist={cookieExist}
    />
  );

  return (
    <>
      <table
        id="monitoring"
        role="list"
        className="divide-y divide-gray-200 dark:divide-gray-700 w-full"
      >
        {groupedSections.map(([gid, section]) => (
          <tbody key={`grp_${gid}`}>
            <tr className="bg-gray-200 dark:bg-gray-800">
              <td
                colSpan={7}
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide"
              >
                {section.name}
              </td>
            </tr>
            {section.hosts.map((host, index) => renderRow(host, index))}
          </tbody>
        ))}
        <tbody>
          {ungrouped.length > 0 && groupedSections.length > 0 && (
            <tr className="bg-gray-200 dark:bg-gray-800">
              <td
                colSpan={7}
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide"
              >
                Ungrouped
              </td>
            </tr>
          )}
          {ungrouped.map((host, index) => renderRow(host, index))}
        </tbody>

        {deleteModalIsVisible ? (
          <MonitoringModal
            setModalIsVisible={setDeleteModalIsVisible}
            acceptText={"Are you sure you want to delete "}
            additionalAcceptText={" Type 'Yes, I'm sure'"}
            confrimButtonName={"Yes, I'm sure"}
            hostname={
              (monitoringData &&
                monitoringData.filter((e) => {
                  return e.id === chosenHost;
                })[0].hostname) ||
              ""
            }
            action={deleteHostAction}
          ></MonitoringModal>
        ) : null}
        {labelModalIsVisible ? (
          <MonitoringModal
            setModalIsVisible={setlabelModalIsVisible}
            acceptText={" Enter label name for "}
            additionalAcceptText={""}
            alertIcoVisible={false}
            hostname={
              (monitoringData &&
                monitoringData.filter((e) => {
                  return e.id === chosenHost;
                })[0].hostname) ||
              ""
            }
            action={saveLabel}
            label={
              (monitoringData &&
                monitoringData.filter((e) => {
                  return e.id === chosenHost;
                })[0].label) ||
              ""
            }
          ></MonitoringModal>
        ) : null}
        {notifyModalIsVisible ? (
          <MonitoringModal
            setModalIsVisible={setNotifyModalIsVisible}
            acceptText={" Enter label name for "}
            additionalAcceptText={""}
            alertIcoVisible={false}
            notifySettings={true}
            chosenHost={chosenHost}
            hostname={
              (monitoringData &&
                monitoringData.filter((e) => {
                  return e.id === chosenHost;
                })[0].hostname) ||
              ""
            }
            action={saveLabel}
          ></MonitoringModal>
        ) : null}
        {hostSettingsModalIsVisible ? (
          <MonitoringModal
            setModalIsVisible={setHostSettingsModalIsVisible}
            alertIcoVisible={false}
            hostSettings={true}
            chosenHost={chosenHost}
            hostname={
              (monitoringData &&
                monitoringData.filter((e) => {
                  return e.id === chosenHost;
                })[0].hostname) ||
              ""
            }
          ></MonitoringModal>
        ) : null}
      </table>
      {assignGroupModalIsVisible && (
        <AssignGroupModal
          setModalIsVisible={setAssignGroupModalIsVisible}
          hostId={chosenHost}
          hostType="host"
          currentGroupId={
            (monitoringData.find((e) => e.id === chosenHost) || {}).groupId || ""
          }
          onAssigned={refreshData}
        />
      )}
      {donutModalIsVisible && (
        <DonutChartModal
          setDonutModalIsVisible={setDonutModalIsVisible}
          hostId={
            monitoringData.filter((e) => {
              return e.id === chosenHost;
            })[0].id
          }
          hostTotalRam={
            monitoringData.filter((e) => {
              return e.id === chosenHost;
            })[0].ram_total
          }
        ></DonutChartModal>
      )}
    </>
  );
};
export default MonitoringTable;
