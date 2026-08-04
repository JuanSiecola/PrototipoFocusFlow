import {
  AlertTriangle,
  Ban,
  CalendarDays,
  CalendarRange,
  CalendarX,
  Clock,
  DollarSign,
  Flag,
  Headphones,
  type LucideIcon,
  ShoppingCart,
  User,
  Users,
} from 'lucide-react';

const ICONOS: Record<string, LucideIcon> = {
  Clock,
  CalendarDays,
  CalendarRange,
  CalendarX,
  AlertTriangle,
  Flag,
  User,
  Ban,
  Users,
  DollarSign,
  Headphones,
  ShoppingCart,
};

interface CategoryIconProps {
  nombre: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ nombre, size = 20, className }: CategoryIconProps) {
  const IconComponent = ICONOS[nombre] ?? Clock;
  return <IconComponent size={size} className={className} />;
}
