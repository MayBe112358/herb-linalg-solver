import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Card, Button, Badge } from '@/components/ui/primitives';

export function HistoryPage() {
  const { saved, loadSaved, deleteSaved } = useAppStore();
  const navigate = useNavigate();

  return (
    <Card title="案例库" subtitle="保存在浏览器本地（localStorage），刷新不丢失">
      {saved.length === 0 ? (
        <p className="text-sm text-slate-400">
          暂无保存的矩阵。在求解台点击「保存到案例库」即可存档当前矩阵。
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {saved.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">{m.name}</p>
                <p className="text-xs text-slate-500">
                  {new Date(m.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="blue">
                  {m.rowLabels.length}×{m.colLabels.length}
                </Badge>
                <Button
                  variant="primary"
                  onClick={() => {
                    loadSaved(m.id);
                    navigate('/');
                  }}
                >
                  载入
                </Button>
                <Button variant="danger" onClick={() => deleteSaved(m.id)}>
                  删除
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
