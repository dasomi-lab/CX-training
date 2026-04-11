import { Contact } from '@/types';

export const mockContacts: Contact[] = [
  { id: 'con-1', projectId: 'proj-1', name: '김철수', company: '중소벤처기업부', role: '담당 주무관', phone: '02-2110-6114', email: 'cs.kim@mss.go.kr' },
  { id: 'con-2', projectId: 'proj-2', name: '박지영', company: '스마트팩토리 추진단', role: '사업 매니저', phone: '02-3455-7890', email: 'jy.park@smartfactory.kr' },
  { id: 'con-3', projectId: 'proj-3', name: '이민준', company: '비앤테크', role: '제품 기획팀장', phone: '010-1234-5678', email: 'mj.lee@bntech.co.kr' },
  { id: 'con-4', projectId: 'proj-5', name: '최수연', company: '비앤테크', role: 'CX 운영 리드', phone: '010-9876-5432', email: 'sy.choi@bntech.co.kr' },
];
