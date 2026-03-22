import { Droplets, Cloud, Grape, SprayCan, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { TreatmentIndex } from '@/types';

interface TreatmentIndicesProps {
  indices: TreatmentIndex[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Droplets': Droplets,
  'Cloud': Cloud,
  'Grape': Grape,
  'SprayCan': SprayCan
};

export function TreatmentIndices({ indices }: TreatmentIndicesProps) {
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-green-600/10 to-green-500/5">
        <CardTitle className="flex items-center gap-2">
          <SprayCan className="h-5 w-5 text-green-600" />
          Indici per Trattamenti in Vigna
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          {indices.map((index, i) => {
            const IconComponent = iconMap[index.icon] || Info;
            const statusBgColors = {
              good: 'bg-green-50 border-green-200',
              caution: 'bg-yellow-50 border-yellow-200',
              bad: 'bg-red-50 border-red-200'
            };
            const statusIcons = {
              good: CheckCircle,
              caution: AlertTriangle,
              bad: AlertTriangle
            };
            const StatusIcon = statusIcons[index.status];

            return (
              <div 
                key={i} 
                className={`p-4 rounded-xl border-2 ${statusBgColors[index.status]} transition-all hover:shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-white/80">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{index.name}</h4>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-5 w-5 ${
                          index.status === 'good' ? 'text-green-600' : 
                          index.status === 'caution' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                        <span className={`text-sm font-medium ${
                          index.status === 'good' ? 'text-green-700' : 
                          index.status === 'caution' ? 'text-yellow-700' : 'text-red-700'
                        }`}>
                          {index.value}%
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={index.value} 
                      className="h-2 mb-2"
                    />
                    <p className="text-sm text-muted-foreground">{index.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
