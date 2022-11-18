import React, { useRef, useEffect } from "react";

/**
 * Hook that alerts clicks outside of the passed ref
 */
function useOutsideHider(ref, state, setstate) {
  useEffect(() => {
  
    /**
     *
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target) && state) {
        setstate(!state);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, state]);
}

/**
 * Component that alerts if you click outside of it
 */
export default function OutsideHider(props) {
  const wrapperRef = useRef(null);
  useOutsideHider(wrapperRef, props.state, props.setstate);

  return <div ref={wrapperRef}>{props.children}</div>;
}
