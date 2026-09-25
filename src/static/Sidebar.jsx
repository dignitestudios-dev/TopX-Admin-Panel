import {
  UserPlus,
  File,
  MessageSquareWarning,
  House,
  Gift,
  BookOpen,
  Layers2,
  BellPlus,
  Smile,
} from 'lucide-react';



export const sidebarData = [
  {
    title: "Dashboard",
    icon: <House />,  // Good choice for dashboard
    link: "/app/dashboard",
  },
  // {
  //   title: "Posts Management",
  //   icon: <File />,  // File icon fits posts/documents better than User
  //   link: "/app/posts",
  // },
 
  {
    title: "User Management",
    icon: <UserPlus />,  // UserPlus fits managing users better than User
    link: "/app/users",
  },
   {
    title: "Page & Post Management",
    icon: <BookOpen />,  // File icon fits posts/documents better than User
    link: "/app/pages",
  },
  {
    title: "Reports",
    icon: <MessageSquareWarning />,
    link: "/app/reports",
  },
  // {
  //   title: "Push Notifications",
  //   icon: <Bell />,  // Bell is perfect for notifications
  //   link: "/app/notifications",
  // },
 
  {
    title: "Rewards ",
    icon: <Gift />,  // Gift icon fits rewards
    link: "/app/rewards",
  },
  {
    title: "Categories ",
    icon: <Layers2 />,  // Gift icon fits rewards
    link: "/app/categories",
  },

  {
    title: "Emojis",
    icon: <Smile />,
    link: "/app/emojis",
  },

  {
    title: "Redemtion Requests ",
    icon: <BellPlus />,  // Gift icon fits rewards
    link: "/app/redemption-requests",
  },

  {
    title: "Expert Requests ",
    icon: <BellPlus />,  // Gift icon fits rewards
    link: "/app/expert-requests",
  },
];
