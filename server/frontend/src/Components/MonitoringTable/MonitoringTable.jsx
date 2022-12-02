import React, { useRef, useEffect } from "react";
import { Tooltip, Dropdown } from "flowbite-react";
import { useState } from "react";
import { addLabel, deleteHost } from "../../../FetchApi";
import MonitoringRow from "./MonitoringRow";
import DonutChart from "react-donut-chart";
import DonutChartModal from "./DonutChartModal";
import MonitoringModal from "./MonitoringModal/MonitoringModal";
import NotificationModal from "./MonitoringModal/NotificationModal";

const MonitoringTable = (props) => {
  const monitoringData = props.monitoringData;
  const refreshData = props.refreshData;

  const [labelModalIsVisible, setlabelModalIsVisible] = useState(false);
  const [notifyModalIsVisible, setNotifyModalIsVisible] = useState(false);
  const [deleteModalIsVisible, setDeleteModalIsVisible] = useState(false);
  const [donutModalIsVisible, setDonutModalIsVisible] = useState(false);

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

  return (
    <>
      <table
        id="monitoring"
        role="list"
        className="divide-y divide-gray-200 dark:divide-gray-700 w-full"
      >
        {monitoringData &&
          monitoringData
            .filter((el) => {
              return !el.no_data;
            })
            .map((host, index) => (
              <MonitoringRow
                host={host}
                setChosenHost={setChosenHost}
                key={`hst_tbl_row_${index}`}
                setDelModalIsVisible={setDeleteModalIsVisible}
                setlabelModalIsVisible={setlabelModalIsVisible}
                setDonutModalIsVisible={setDonutModalIsVisible}
                setNotifyModalIsVisible={setNotifyModalIsVisible}
              />
            ))}

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
      </table>
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
