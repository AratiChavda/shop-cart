import { useClient } from "@/hooks/useClient";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  const { logo } = useClient();
  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full bg-white border-b border-gray-200 fixed top-0 z-50">
        <div className="flex items-center justify-between px-2 py-3 sm:px-1 md:px-3">
          <div className="flex gap-1">
            <Link
              to="/"
              className="hover:opacity-80 transition-opacity duration-200"
            >
              <img
                src={logo}
                alt="logo"
                className="h-8 w-auto object-contain sm:h-10"
              />
            </Link>
          </div>
        </div>
      </header>
      <div className="flex flex-col min-h-screen pt-[64px]">
        <main className="flex-1 bg-background overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default PublicLayout;
