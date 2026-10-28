import { createBrowserRouter, Outlet } from "react-router";
import { Layout } from "./components/Layout.tsx";
import { LoadingScreen } from "./components/LoadingScreen.tsx";
import { guestOnly, requireUser, ROOT_ROUTE_ID, rootLoader } from "./lib/auth.ts";
import { loginAction, logoutAction, registerAction } from "./pages/auth/auth.actions.ts";
import { LoginPage } from "./pages/auth/LoginPage.tsx";
import { RegisterPage } from "./pages/auth/RegisterPage.tsx";
import { ErrorPage } from "./pages/ErrorPage.tsx";
import { AddGroupPage } from "./pages/groups/AddGroupPage.tsx";
import { BookingsPage } from "./pages/groups/BookingsPage.tsx";
import { GroupDetailPage } from "./pages/groups/GroupDetailPage.tsx";
import {
  addGroupAction,
  addGroupLoader,
  bookingsAction,
  bookingsLoader,
  groupDetailLoader,
  groupsAction,
  groupsLoader,
  homeLoader,
  manageGroupAction,
  manageGroupLoader,
} from "./pages/groups/groups.data.ts";
import { GroupsPage } from "./pages/groups/GroupsPage.tsx";
import { ManageGroupPage } from "./pages/groups/ManageGroupPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";
import { AddVenuePage } from "./pages/venues/AddVenuePage.tsx";
import { EditVenuePage } from "./pages/venues/EditVenuePage.tsx";
import { addVenueAction, editVenueAction, editVenueLoader, venuesLoader } from "./pages/venues/venues.data.ts";
import { VenuesPage } from "./pages/venues/VenuesPage.tsx";

export const router = createBrowserRouter([
  {
    id: ROOT_ROUTE_ID,
    path: "/",
    loader: rootLoader,
    element: <Layout />,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <LoadingScreen />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <HomePage />, loader: homeLoader },
          { path: "logout", action: logoutAction },
          {
            loader: guestOnly,
            element: <Outlet />,
            children: [
              { path: "login", element: <LoginPage />, action: loginAction },
              { path: "register", element: <RegisterPage />, action: registerAction },
            ],
          },
          {
            loader: requireUser,
            element: <Outlet />,
            children: [
              {
                path: "venues",
                children: [
                  { index: true, element: <VenuesPage />, loader: venuesLoader },
                  { path: "new", element: <AddVenuePage />, action: addVenueAction },
                  {
                    path: ":venueId/edit",
                    element: <EditVenuePage />,
                    loader: editVenueLoader,
                    action: editVenueAction,
                  },
                ],
              },
              {
                path: "groups",
                children: [
                  { index: true, element: <GroupsPage />, loader: groupsLoader, action: groupsAction },
                  { path: "new", element: <AddGroupPage />, loader: addGroupLoader, action: addGroupAction },
                  { path: ":groupId", element: <GroupDetailPage />, loader: groupDetailLoader },
                  {
                    path: ":groupId/manage",
                    element: <ManageGroupPage />,
                    loader: manageGroupLoader,
                    action: manageGroupAction,
                  },
                  {
                    path: ":groupId/bookings",
                    element: <BookingsPage />,
                    loader: bookingsLoader,
                    action: bookingsAction,
                  },
                ],
              },
            ],
          },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
