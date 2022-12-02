import React from "react";
import { Tooltip, Dropdown } from "flowbite-react";
import { useState } from "react";

// : 90,
//   "valid": true,
//   "validFrom": "issue date",
//   "validTo": "expiry date",
//   "validFor": ["www.example.com", "example.com"]

const SSLinfo = ({ certInfo }) => {
  return (
    <>
      {certInfo ? (
        <Tooltip
          content={[
            <div>
              <h5 className="flex justify-center mb-3">
                Certificate validity information
              </h5>
              <table>
                <tr>
                  <td>
                    <span className="font-thin mr-1 mb-1">
                      Days for remaining:
                    </span>
                  </td>
                  <td>
                    <span> {certInfo?.daysRemaining}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="font-thin mr-1 mb-1">Valid from:</span>
                  </td>
                  <td>
                    <span> {new Date(certInfo?.validFrom).toString()}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="font-thin mr-1 mb-1">Valid to:</span>
                  </td>
                  <td>
                    <span> {new Date(certInfo?.validTo).toString()}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="font-thin mr-1 mb-1"> Valid for:</span>
                  </td>
                  <td>
                    <span> {certInfo?.validFor.join(" |")}</span>
                  </td>
                </tr>
              </table>
            </div>,
           
          ]}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </Tooltip>
      ) : null}
    </>
  );
};

export default SSLinfo;
