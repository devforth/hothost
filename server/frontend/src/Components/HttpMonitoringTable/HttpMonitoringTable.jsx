import React, { useState } from "react";

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
          currentGroupId={
            (httpMOnitors.find((m) => m.id === chosenId) || {}).groupId || ""
          }
          onAssigned={refreshData}
        />
      )}
      {}
    </>
  );
};
export default httpMonitoringTable;
