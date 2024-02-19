import React from "react";
import { useState, useEffect } from "react";

import HttpTableRow from "./HttpTableRow";
import ModalDelete from "./ModalDelete";
import ModalAddLabel from "./ModalAddLabel";
import HostNotificationModal from "./HostNotificationModal";
import ModalRssFilters from "./ModalRssFilters";

const httpMonitoringTable = (props) => {
  const cookieExist = props.cookieExist
  const httpMOnitors = props.monitoringHttpData;
  const setMonitoringHttpData = props.setMonitoringHttpData;
  const checkSslWarn = props.checkSslWarn;
  const changeMonitorSetting = props.changeMonitorSetting;
  const [deleteModalIsVisible, setDeleteModalIsVisible] = useState(false);
  const [labelModalIsVisible, setLabelModalIsVisible] = useState(false);
  const [settingsViewIsVisible, setSettingsViewIsVisible] = useState(true);
  const [chosenId, setChosenId] = useState("");
  const [hostNotificationIsVisible, setHostNotificationVisible] =
    useState(false);
  const [rssFilterIsVisible, setRssFilterIsVisible] = useState(false);

  return (
    <>
      <table
        id="httpMonitoring"
        role="list"
        className="divide-y divide-gray-200 dark:divide-gray-700 w-full"
      >
        {httpMOnitors &&
          httpMOnitors.length > 0 &&
          httpMOnitors.map((monitor, i) => {
            return (
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
                key={`http_tbl_row_${i}`}
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
              ></HttpTableRow>
            );
          })}
        {}
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
      {}
    </>
  );
};
export default httpMonitoringTable;
