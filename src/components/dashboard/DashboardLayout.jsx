import DashboardSidebar from '../dashboard/DashboardSideBar'
const DashboardLayout = ({ children }) => {
  // const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 lg:ml-[245px] p-5 mt-16 lg:mt-0">
        {/* Dashboard Content */}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
