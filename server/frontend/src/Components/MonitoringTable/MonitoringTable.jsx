import React, { useRef, useEffect } from "react";
import { Tooltip, Dropdown, Toast } from "flowbite-react";
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
  const [groupToast, setGroupToast] = useState(null);

  const [chosenHost, setChosenHost] = useState("");

  const onGroupAssigned = (group) => {
    refreshData();
    const noPlugins =
      group && (!group.installedPlugins || group.installedPlugins.length === 0);
    setGroupToast({
      message: noPlugins
        ? `Assigned to "${group.name}", but it has no notification plugin installed.`
        : "Group assignment saved!",
      warn: !!noPlugins,
    });
    setTimeout(() => setGroupToast(null), 5000);
  };

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
          hostName={(() => {
            const h = monitoringData.find((e) => e.id === chosenHost) || {};
            return [h.os_name, h.hostname].filter(Boolean).join(" · ");
          })()}
          currentGroupId={
            (monitoringData.find((e) => e.id === chosenHost) || {}).groupId || ""
          }
          onAssigned={onGroupAssigned}
        />
      )}
      {groupToast && (
        <div className="fixed bottom-0 right-0 z-50 p-4">
          <Toast
            className={
              groupToast.warn
                ? "bg-amber-100 dark:bg-amber-800 dark:text-amber-100"
                : "bg-green-100 dark:bg-green-800 dark:text-green-200"
            }
          >
            <div
              className={`inline-flex mr-1 h-8 w-8 shrink-0 shadow-lg items-center justify-center rounded-lg ${
                groupToast.warn
                  ? "bg-amber-100 text-amber-500 dark:bg-amber-800 dark:text-amber-100"
                  : "bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200"
              }`}
            >
              {groupToast.warn ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 text-sm font-normal">{groupToast.message}</div>
            <Toast.Toggle />
          </Toast>
        </div>
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
