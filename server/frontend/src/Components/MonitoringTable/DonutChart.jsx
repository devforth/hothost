import DonutChart from "react-donut-chart";
import { useState, useEffect } from "react";

const MyDonutChart = (props) => {
  const chartData = props.chartData.process;
  const ramUsage = props.chartData.totalRamUsage
  let totallUsageAll = 0;

  const addTransitionToSector = function (color) {
    const els = document.querySelectorAll(".donutChart-arcs-path");
    els.forEach((e) => {
      e.style.transform = "";
      e.style.transition = "";
      e.style.opacity = "0.7";
    });
    const el = document.querySelector(`[fill="${color}"]`);

    if (el) {
      el.style.transform = "scale(1.06)";
      el.style.transition = "0.5s";
      el.style.transformOrigin = "center";
      el.style.opacity = "1";
    }
  };

  const deleteTransitionFromSector = function (color) {
    const el = document.querySelector(`[fill="${color}"]`);

    if (el) {
      el.style.transform = "";
      el.style.transition = "";
    }
  };

  // optional: save the width of the window using state
  const [width, setWidth] = useState(window.innerWidth); // check width size of the window
  const [selectedProcess, setSelectedProcess] = useState("");
  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  const [chosenSectorId, setChosenSectorId] = useState("");

  chartData.forEach((element) => {
    totallUsageAll = +element.total_usage + totallUsageAll;
  });

  const dataForChart = chartData.map((el) => {
    return {
      label: `shartId-${el.id}`,
      value: (+el.total_usage / totallUsageAll) * 100,
    };
  });

  const colors = chartData.map((e) => e.color);

  return (
    <div className="flex justify-between mobile:justify-start">
      <DonutChart
        data={dataForChart}
        colors={colors}
        legend={false}
        width={width > 600 ? 250 : 150}
        onMouseLeave={(e) => {
          setChosenSectorId(e.id);
        }}
        clickToggle={true}
        selectedOffset={0.0}
        toggledOffset={0}
        innerRadius={0.6}
        className="donutChart"
      />
      <div
        className="w-[65%] ml-auto mobile:w-15
        mobile:ml-0"
      >
        {ramUsage? <p className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400 whitespace-normal">Occupied RAM : {ramUsage} </p>:null}
        
        <ul
          onMouseLeave={() => {
            setSelectedProcess("");
          }}
          className="mobile:flex-col  "
        >
          {chartData.map((el) => {
            return (
              <li
                key={`shartId-${el.id}`}
                id={`shartId-${el.id}`}
                data-color={el.color}
                onMouseEnter={(e) => {
                  addTransitionToSector(e.target.dataset.color);
                }}
                onMouseLeave={(e) => {
                  deleteTransitionFromSector(e.target.dataset.color);
                }}
                className={`gap-4
                py-4
                flex
                mobile:justify-end
                
                items-center
                cursor-default
                text-sm
                dark:text-gray-200 opacity-40 hover:opacity-100 ${
                  chosenSectorId === `shartId-${el.id}` ? "opacity-100" : ""
                }`}
              >
                <div>
                  <div
                    class="h-4 w-4 rounded-full"
                    style={{ backgroundColor: el.color }}
                  ></div>
                </div>
                <div class="grow-1 w-20 font-bold">{`${el.ram_usage}`}</div>
                <div class="flex-1 break-all mobile:hidden">{`${el.data}`}</div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default MyDonutChart;
