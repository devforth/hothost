import React, { useState } from "react";
import { Toast } from "flowbite-react";

import HttpTableRow from "./HttpTableRow";
import ModalDelete from "./ModalDelete";
import ModalAddLabel from "./ModalAddLabel";
import HostNotificationModal from "./HostNotificationModal";
import ModalRssFilters from "./ModalRssFilters";
import AssignGroupModal from "../HostGroups/AssignGroupModal";

const httpMonitoringTable = (props) => {
  const cookieExist = props.cookieExist;
  const httpMOnitors = props.monitoringHttpData;
  const setMonitoringHttpData = props.setMonitoringHttpData;
  const checkSslWarn = props.checkSslWarn;
  const changeMonitorSetting = props.changeMonitorSetting;
  const refreshData = props.refreshData;
  const [deleteModalIsVisible, setDeleteModalIsVisible] = useState(false);
  const [labelModalIsVisible, setLabelModalIsVisible] = useState(false);
  const [chosenId, setChosenId] = useState("");
  const [hostNotificationIsVisible, setHostNotificationVisible] =
    useState(false);
  const [rssFilterIsVisible, setRssFilterIsVisible] = useState(false);
  const [assignGroupModalIsVisible, setAssignGroupModalIsVisible] =
    useState(false);
  const [groupToast, setGroupToast] = useState(null);

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

  const groupsMap = new Map();
  const ungrouped = [];
  (httpMOnitors || []).forEach((monitor) => {
    if (monitor.groupId) {
      if (!groupsMap.has(monitor.groupId)) {
        groupsMap.set(monitor.groupId, {
          name: monitor.groupName || "Unnamed group",
          monitors: [],
        });
      }
      groupsMap.get(monitor.groupId).monitors.push(monitor);
    } else {
      ungrouped.push(monitor);
    }
  });
  const groupedSections = Array.from(groupsMap.entries()).sort((a, b) =>
    (a[1].name || "").localeCompare(b[1].name || "")
  );

  const renderRow = (monitor, i) => (
    <HttpTableRow
      monitor={monitor}
      cookieExist={cookieExist}
      getDeleteId={(e) => {
        setChosenId(e);
        setDeleteModalIsVisible(true);
      }}
      closeDeleteModal={() => {
        setDeleteModalIsVisible(false);
      }}
      key={`http_tbl_row_${monitor.id}_${i}`}
      getLabelId={(e) => {
        setChosenId(e);
        setLabelModalIsVisible(true);
      }}
      checkSslWarn={checkSslWarn}
      changeMonitorSetting={changeMonitorSetting}
      getNOtificationOfMonitor={(e) => {
        setChosenId(e);
        setHostNotificationVisible(true);
      }}
      getRssFilters={(e) => {
        setChosenId(e);
        setRssFilterIsVisible(true);
      }}
      getAssignGroupId={(e) => {
        setChosenId(e);
        setAssignGroupModalIsVisible(true);
      }}
    />
  );

  const groupHeaderClass =
    "px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide";

  return (
    <>
      <table
        id="httpMonitoring"
        role="list"
        className="divide-y divide-gray-200 dark:divide-gray-700 w-full"
      >
        {groupedSections.map(([gid, section]) => (
          <React.Fragment key={`grp_${gid}`}>
            <tbody>
              <tr className="bg-gray-200 dark:bg-gray-800">
                <td colSpan={7} className={groupHeaderClass}>
                  {section.name}
                </td>
              </tr>
            </tbody>
            {section.monitors.map((monitor, i) => renderRow(monitor, i))}
          </React.Fragment>
        ))}
        {ungrouped.length > 0 && groupedSections.length > 0 && (
          <tbody>
            <tr className="bg-gray-200 dark:bg-gray-800">
              <td colSpan={7} className={groupHeaderClass}>
                Ungrouped
              </td>
            </tr>
          </tbody>
        )}
        {ungrouped.map((monitor, i) => renderRow(monitor, i))}
      </table>
      {deleteModalIsVisible ? (
        <ModalDelete
          monitor={
            chosenId &&
            httpMOnitors.filter((m) => {
              return m.id === chosenId;
            })[0]
          }
          isOpen={deleteModalIsVisible}
          setMonitoringHttpData={setMonitoringHttpData}
          setDeleteModalIsVisible={setDeleteModalIsVisible}
        ></ModalDelete>
      ) : (
        ""
      )}
      {labelModalIsVisible ? (
        <ModalAddLabel
          monitor={
            chosenId &&
            httpMOnitors.filter((m) => {
              return m.id === chosenId;
            })[0]
          }
          isOpen={labelModalIsVisible}
          setMonitoringHttpData={setMonitoringHttpData}
          setLabelModalIsVisible={setLabelModalIsVisible}
        ></ModalAddLabel>
      ) : null}
      {hostNotificationIsVisible ? (
        <HostNotificationModal
          setModalIsVisible={setHostNotificationVisible}
          monitor={
            chosenId &&
            httpMOnitors.filter((m) => {
              return m.id === chosenId;
            })[0]
          }
        ></HostNotificationModal>
      ) : null}
      {rssFilterIsVisible ? (
        <ModalRssFilters
          setModalIsVisible={setRssFilterIsVisible}
          monitor={
            chosenId &&
            httpMOnitors.filter((m) => {
              return m.id === chosenId;
            })[0]
          }
        ></ModalRssFilters>
      ) : null}
      {assignGroupModalIsVisible && (
        <AssignGroupModal
          setModalIsVisible={setAssignGroupModalIsVisible}
          hostId={chosenId}
          hostType="http"
          hostName={
            (httpMOnitors.find((m) => m.id === chosenId) || {}).name || ""
          }
          currentGroupId={
            (httpMOnitors.find((m) => m.id === chosenId) || {}).groupId || ""
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
      {}
    </>
  );
};
export default httpMonitoringTable;
