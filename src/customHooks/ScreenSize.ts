import { useEffect, useState } from "react";

export const useScreenSize = () => {
  const [size, setSize] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
};