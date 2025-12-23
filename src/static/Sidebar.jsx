import { Blocks } from 'lucide-react';
import { User } from 'lucide-react';
import { Car } from 'lucide-react';
import { UserPlus } from 'lucide-react';
import { File } from 'lucide-react';
import { Bell } from 'lucide-react';
import { MessageSquareWarning } from 'lucide-react';
import { Calendar } from 'lucide-react';
import { House } from 'lucide-react';
import { Gift } from 'lucide-react';
import { BookOpen } from 'lucide-react';
import { Layers2 } from 'lucide-react';
import { BellPlus } from 'lucide-react';



export const sidebarData = [
  {
    title: "Dashboard",
    icon: <House />,  // Good choice for dashboard
    link: "/app/dashboard",
  },
  {
    title: "Posts Management",
    icon: <File />,  // File icon fits posts/documents better than User
    link: "/app/posts",
  },
 
  {
    title: "User Management",
    icon: <UserPlus />,  // UserPlus fits managing users better than User
    link: "/app/users",
  },
   {
    title: "Page Management",
    icon: <BookOpen />,  // File icon fits posts/documents better than User
    link: "/app/pages",
  },
  // {
  //   title: "Reports",
  //   icon: <MessageSquareWarning />,  // Warning icon works well for reports
  //   link: "/app/reports",
  // },
  {
    title: "Push Notifications",
    icon: <Bell />,  // Bell is perfect for notifications
    link: "/app/notifications",
  },
 
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
