import React from "react";
import { useState, useEffect } from "react";
import { getData } from "../../../FetchApi";
import HttpTableRow from "./HttpTableRow";
import ModalDelete from "./ModalDelete";

const httpMonitoringTable = (props) => {
  const httpMOnitors = props.monitoringHttpData;
  const setMonitoringHttpData = props.setMonitoringHttpData;
  const [deleteModalIsVisible, setDeleteModalIsVisible] = useState(false);
  const [chosenId, setChosenId] = useState("");

  return (
    <>
      <table
        id="httpMonitoring"
        role="list"
        class="divide-y divide-gray-200 dark:divide-gray-700 w-full"
      >
        {httpMOnitors &&
          httpMOnitors.length > 0 &&
          httpMOnitors.map((monitor, i) => {
            return (
              <HttpTableRow
                monitor={monitor}
                getDeleteId={(e) => {
                  setChosenId(e);
                  setDeleteModalIsVisible(true);
                }}
                closeDeleteModal={() => {
                  setDeleteModalIsVisible(false);
                }}
                key={i}
              ></HttpTableRow>
            );
          })}
        {}
      </table>
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
    </>
  );
};
export default httpMonitoringTable;
