// Main entry point for shared-ui components
// Use specific imports for better tree-shaking and performance

// Atoms - Export individually for better tree-shaking
export { Button, buttonVariants } from './atoms/button'
export { Badge, badgeVariants } from './atoms/badge'
export { Input } from './atoms/input'
export { Label } from './atoms/label'
export { Checkbox } from './atoms/checkbox'
export { Switch } from './atoms/switch'
export { Separator } from './atoms/separator'
export { Alert, AlertDescription, AlertTitle } from './atoms/alert'
export { Loading } from './atoms/loading'
export { Textarea } from './atoms/textarea'
export { Tabs, TabsContent, TabsList, TabsTrigger } from './atoms/tabs'

// Molecules - Export individually
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './molecules/card'
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from './molecules/select'
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField
} from './molecules/form'
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from './molecules/dropdown-menu'

// Organisms - Export individually
export { AdminSidebar } from './organisms/admin-sidebar'
export type { SidebarConfig, MenuItem, SidebarTheme, SidebarBehavior, SidebarUser } from './types/sidebar'
export { ThemeSelector } from './organisms/theme-selector'
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
} from './organisms/dialog'
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from './organisms/table'

// Export utilities
export { cn } from './utils/cn'

// Export types
// TODO: Fix type exports after build issues are resolved