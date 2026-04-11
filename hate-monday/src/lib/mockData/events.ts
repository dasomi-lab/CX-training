import { CalendarEvent } from '@/types';

const year = new Date().getFullYear();
const month = String(new Date().getMonth() + 1).padStart(2, '0');
const d = (day: number) => `${year}-${month}-${String(day).padStart(2, '0')}`;

export const mockEvents: CalendarEvent[] = [
  { id: 'ev-1',  projectId: 'proj-1', title: 'R&D 지원 마감',        date: d(15), type: 'deadline' },
  { id: 'ev-2',  projectId: 'proj-2', title: '스마트팩토리 킥오프',  date: d(3),  type: 'milestone' },
  { id: 'ev-3',  projectId: 'proj-3', title: '린클 Pro 2.0 기획 회의', date: d(7), time: '10:00', type: 'meeting' },
  { id: 'ev-4',  projectId: 'proj-3', title: '베타 테스트 시작',     date: d(20), type: 'milestone' },
  { id: 'ev-5',  projectId: 'proj-4', title: '디자인 시안 발표',     date: d(10), time: '14:00', type: 'meeting' },
  { id: 'ev-6',  projectId: 'proj-5', title: 'CS 프로세스 배포',     date: d(18), type: 'milestone' },
  { id: 'ev-7',  projectId: 'proj-6', title: '설문 배포 마감',       date: d(25), type: 'deadline' },
  { id: 'ev-8',  projectId: null,     title: '월간 팀 회의',         date: d(5),  time: '09:00', type: 'meeting' },
  { id: 'ev-9',  projectId: null,     title: '분기 OKR 점검',        date: d(12), time: '15:00', type: 'meeting' },
  { id: 'ev-10', projectId: 'proj-1', title: '서류 제출 기한',       date: d(28), type: 'deadline' },
  { id: 'ev-11', projectId: 'proj-2', title: '사업계획서 제출',      date: d(22), type: 'deadline' },
  { id: 'ev-12', projectId: 'proj-5', title: '팀원 교육 워크샵',     date: d(14), time: '13:00', type: 'meeting' },
];
