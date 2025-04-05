import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Command,
  CreditCard,
  File,
  FileText,
  HelpCircle,
  Image,
  Laptop,
  Loader2,
  type LightbulbIcon as LucideProps,
  Moon,
  MoreVertical,
  Pizza,
  Plus,
  Settings,
  SunMedium,
  Trash,
  Twitter,
  User,
  X,
  Menu,
  Video,
  BarChart,
  LogOut,
  Home,
  Upload,
  Play,
  Pause,
  Eye,
  ThumbsUp,
  Clock,
  Calendar,
  Share2,
  Edit,
  Bookmark,
  Download,
  Filter,
  Search,
  Bell,
  MessageSquare,
  Users,
  Lock,
  Unlock,
  Globe,
  Shield,
  Star,
  Heart,
  Zap,
  Layers,
  PlusCircle,
  MinusCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Layout,
  Github,
  type LucideIcon,
} from "lucide-react"

export type Icon = LucideIcon

export const Icons = {
  logo: Command,
  close: X,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  post: FileText,
  page: File,
  media: Image,
  settings: Settings,
  billing: CreditCard,
  ellipsis: MoreVertical,
  add: Plus,
  warning: AlertTriangle,
  user: User,
  arrowRight: ArrowRight,
  help: HelpCircle,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  gitHub: Github,
  google: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="google"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 488 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
      ></path>
    </svg>
  ),
  twitter: Twitter,
  check: Check,
  menu: Menu,
  video: Video,
  barChart: BarChart,
  logOut: LogOut,
  home: Home,
  upload: Upload,
  play: Play,
  pause: Pause,
  eye: Eye,
  thumbsUp: ThumbsUp,
  clock: Clock,
  calendar: Calendar,
  share: Share2,
  edit: Edit,
  bookmark: Bookmark,
  download: Download,
  filter: Filter,
  search: Search,
  bell: Bell,
  message: MessageSquare,
  users: Users,
  lock: Lock,
  unlock: Unlock,
  globe: Globe,
  shield: Shield,
  star: Star,
  heart: Heart,
  zap: Zap,
  layers: Layers,
  plusCircle: PlusCircle,
  minusCircle: MinusCircle,
  checkCircle: CheckCircle,
  xCircle: XCircle,
  alertCircle: AlertCircle,
  info: Info,
  dashboard: Layout,
  plus: Plus,
}

