import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const MyHostsTableSceleton = ({ quantity = 5 }) => {
  const arr = new Array(quantity).fill(1);
  console.log(arr);
  const monitorRow = (
    <tr className="py-4 mobile:grid grid-cols-3 grid-rows-3 gap-4 border-b last:border-b-0 border-gray-200 dark:border-gray-700 w-full">
      <td className="mobile:hidden  flex-shrink-0 h-[64px] w-[64px]">
        <Skeleton
          circle={true}
          width={32}
          height={32}
          baseColor={"#c7c7c7"}
        ></Skeleton>
      </td>
      <td>
        <Skeleton width={50} height={16} baseColor={"#c7c7c7"}></Skeleton>
      </td>
      <td className="pr-4 flex-1 col-start-3 row-start-1  items-center text-base font-semibold text-gray-900 dark:text-white place-self-center">
        <Skeleton
          count={2}
          height={16}
          width={174}
          baseColor={"#c7c7c7"}
        ></Skeleton>
      </td>
      <td className="pr-4 flex-1 col-start-1 row-start-1 min-w-max">
        <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap flex">
          <Skeleton
            count={2}
            height={16}
            width={120}
            baseColor={"#c7c7c7"}
          ></Skeleton>
        </div>
      </td>
      <td className="flex-1 col-start-1 row-start-3 sm:px-4 min-w-max">
        <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap flex">
          <Skeleton
            count={2}
            height={16}
            width={270}
            baseColor={"#c7c7c7"}
          ></Skeleton>
        </div>
      </td>
      <td className="flex-1 pr-4 col-start-1 row-start-2 col-span-2 min-w-max">
        <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap flex">
          <Skeleton
            count={2}
            height={16}
            width={120}
            baseColor={"#c7c7c7"}
          ></Skeleton>
        </div>
      </td>

      <td className="flex-1 pr-4 col-start-2 row-start-3 items-center text-[6px] font-semibold text-gray-900 dark:text-white min-w-max relative">
        {" "}
        <Skeleton circle={true} width={6} height={6}></Skeleton>
        <Skeleton circle={true} width={6} height={6}></Skeleton>
        <Skeleton circle={true} width={6} height={6}></Skeleton>
      </td>
    </tr>
  );

  return (
    <table
      id="monitoring"
      role="list"
      className="divide-y divide-gray-200 dark:divide-gray-700 w-full"
    >
      {arr.map((e) => {
        return monitorRow;
      })}
    </table>
  );
};
export default MyHostsTableSceleton;
