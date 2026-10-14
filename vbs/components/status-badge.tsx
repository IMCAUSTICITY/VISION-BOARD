import { Badge } from "@/components/ui/badge"
import { statusMeta } from "@/lib/constants"
export const StatusBadge = ({ status }: { status: string }) => <Badge variant="secondary" className={statusMeta(status).cls}>{statusMeta(status).label}</Badge>
