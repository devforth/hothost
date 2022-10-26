import React from "react";
import { useState, useEffect } from "react";
import { getData } from "../../../FetchApi";
import HttpTableRow from "./HttpTableRow";
import ModalDelete from "./ModalDelete";
import ModalAddLabel from "./ModalAddLabel";

const httpMonitoringTable = (props) => {
  const httpMOnitors = props.monitoringHttpData;
  const setMonitoringHttpData = props.setMonitoringHttpData;
  const [deleteModalIsVisible, setDeleteModalIsVisible] = useState(false);
  const [labelModalIsVisible, setLabelModalIsVisible] = useState(false);
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
                key={`http_tbl_row_${i}`}
                getLabelId={(e) => {
                  setChosenId(e);
                  setLabelModalIsVisible(true);
                  console.log("labelModal", labelModalIsVisible);
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
    </>
  );
};
export default httpMonitoringTable;
