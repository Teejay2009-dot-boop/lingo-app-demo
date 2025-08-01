import DashboardSidebar from "../dashboard/DashboardSideBar";
const DashboardLayout = ({ children }) => {
  // const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex ">
      <DashboardSidebar />
      <main className="flex-1 lg:ml-[245px] mt-0 lg:mt-0">
        {/* Dashboard Content */}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
