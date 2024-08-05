import { useEffect, useContext } from "react";
import { UNSAFE_NavigationContext as NavigationContext } from "react-router-dom";
import { globalConfirm } from "../utility/globalConfirm";

export const usePrompt = (message, when) => {
  const { navigator } = useContext(NavigationContext);

  useEffect(() => {
    if (!when) return;

    // Function to handle navigation block
    const handleNavigation = async (tx) => {
      // Show confirmation dialog
      const confirmed = await globalConfirm(message);
      if (confirmed) {
        // Unblock navigation and retry the transition if confirmed
        unblock();
        tx.retry();
      }
    };

    // Set up the navigation blocker
    const unblock = navigator.block((tx) => handleNavigation(tx));

    // Clean up the navigation blocker on component unmount
    return unblock;
  }, [navigator, message, when]);
};
