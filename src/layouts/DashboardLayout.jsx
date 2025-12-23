import { Outlet } from "react-router";
import DummyNavbar from "../components/layout/DummyNavbar";
import DummySidebaar from "../components/layout/DummySidebaar";
import { useEffect, useState } from "react";
import NoInternetModal from "../components/global/NoInternet";
import { NoInternetImage } from "../assets/export";
import { background } from "../assets/export";

const DashboardLayout = () => {
  const [openNoInternet, setOpenNoInternet] = useState(false);

  useEffect(() => {
    if (!navigator.onLine) {
      setOpenNoInternet(true);
    }
  }, []);

  return (
    <div className="overflow-y-auto bg-gray-50 min-h-screen w-full  "
    
  //   style={{
  //   backgroundImage: `url(${background})`,
  //   backgroundSize: "cover",
  //   backgroundPosition: "center",
  // }}
>
    
    <div className="">
    <div className="w-full h-screen flex overflow-hidden">
      <div className="h-full mt-4 ml-4 rounded-xl border border-[#DE4B12] overflow-y-auto overflow-hidden scrollbar-hidden">
        <DummySidebaar />
      </div>

      <div className="flex flex-col w-[calc(100%-15rem)] h-full ">
        {/* <div className="w-[97.5%]  ml-4 rounded-lg h-[100px]  flex justify-center items-center">
          <div className="w-[100%]">
            <DummyNavbar />
          </div>
        </div> */}

        <div className="w-full  h-full pt-2 overflow-auto scrollbar-hidden">
          <img src={NoInternetImage} alt="" className="hidden" />
          <NoInternetModal isOpen={openNoInternet} />
          <Outlet />
        </div>
      </div>
    </div>
    </div>
    </div>
  );
};


export default DashboardLayout;
