import { Task } from '@/types';

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const mockTasks: Task[] = [
  // Today
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: '지원서 최종 검토 및 서명',
    dueDate: fmt(today),
    status: 'todo',
    priority: 'high',
  },
  {
    id: 'task-2',
    projectId: 'proj-3',
    title: '기능 명세서 업데이트',
    dueDate: fmt(today),
    status: 'todo',
    priority: 'medium',
  },
  {
    id: 'task-3',
    projectId: 'proj-5',
    title: 'CS 매뉴얼 1차 초안 작성',
    dueDate: fmt(today),
    status: 'todo',
    priority: 'high',
  },
  {
    id: 'task-4',
    projectId: null,
    title: '주간 업무 보고서 제출',
    dueDate: fmt(today),
    status: 'todo',
    priority: 'medium',
  },
  {
    id: 'task-5',
    projectId: 'proj-4',
    title: '디자인 레퍼런스 수집',
    dueDate: fmt(today),
    status: 'todo',
    priority: 'low',
  },
  // Upcoming
  {
    id: 'task-6',
    projectId: 'proj-1',
    title: '정부24 온라인 제출',
    dueDate: fmt(addDays(today, 2)),
    status: 'todo',
    priority: 'high',
  },
  {
    id: 'task-7',
    projectId: 'proj-2',
    title: '사업계획서 1차 작성',
    dueDate: fmt(addDays(today, 3)),
    status: 'todo',
    priority: 'high',
  },
  {
    id: 'task-8',
    projectId: 'proj-3',
    title: 'UI 목업 디자인 검토',
    dueDate: fmt(addDays(today, 4)),
    status: 'todo',
    priority: 'medium',
  },
  {
    id: 'task-9',
    projectId: 'proj-5',
    title: '팀원 교육 자료 배포',
    dueDate: fmt(addDays(today, 5)),
    status: 'todo',
    priority: 'medium',
  },
  {
    id: 'task-10',
    projectId: 'proj-6',
    title: '설문지 문항 확정',
    dueDate: fmt(addDays(today, 7)),
    status: 'todo',
    priority: 'low',
  },
  // Done
  {
    id: 'task-11',
    projectId: 'proj-1',
    title: '접수 서류 스캔 및 정리',
    dueDate: fmt(addDays(today, -3)),
    status: 'done',
    priority: 'medium',
  },
  {
    id: 'task-12',
    projectId: 'proj-3',
    title: '경쟁사 벤치마킹 분석',
    dueDate: fmt(addDays(today, -5)),
    status: 'done',
    priority: 'low',
  },
  {
    id: 'task-13',
    projectId: 'proj-5',
    title: 'CS 현황 데이터 수집',
    dueDate: fmt(addDays(today, -7)),
    status: 'done',
    priority: 'high',
  },
  {
    id: 'task-14',
    projectId: 'proj-2',
    title: '담당자 미팅 일정 조율',
    dueDate: fmt(addDays(today, -2)),
    status: 'done',
    priority: 'medium',
  },
  {
    id: 'task-15',
    projectId: null,
    title: '월간 업무 계획서 작성',
    dueDate: fmt(addDays(today, -10)),
    status: 'done',
    priority: 'low',
  },
];
