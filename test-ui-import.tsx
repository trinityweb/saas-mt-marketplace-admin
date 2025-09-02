// Test file para probar imports @/ui
import { Button, Input, Progress, Card } from '@/ui'

export function TestComponent() {
  return (
    <Card>
      <Button>Test Button</Button>
      <Input placeholder="Test Input" />
      <Progress value={50} />
    </Card>
  )
}
