export interface PartyOrder {
  id: string;
  recipeId: string;
  recipeName: string;
  customerName: string;          // 点单客人昵称
  customerAvatar?: string;
  tableOrSeat?: string;          // 坐在哪里 / 留言 (如: '沙发靠窗', '露营天幕下')
  specialNotes?: string;         // 定制备注 (如: '少放冰', '多点薄荷', '少糖微醺')
  status: 'pending' | 'mixing' | 'served' | 'cancelled';
  createdAt: number;
}

export interface PartySession {
  id: string;
  title: string;                 // 派对名称 (如: '周五下班微醺夜', '中秋露营吧台')
  bartenderName: string;         // 房主调酒师昵称
  welcomeMessage: string;        // 欢迎语
  activeRecipeIds: string[];     // 今晚特供酒单 (仅限房主酒柜能做的酒)
  createdAt: number;
  isOpen: boolean;               // 是否正在营业/接单
}
