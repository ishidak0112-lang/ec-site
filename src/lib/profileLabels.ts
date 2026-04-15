import type { Gender } from '@prisma/client'

export const genderLabel: Record<Gender, string> = {
  UNKNOWN: '未設定',
  MALE: '男性',
  FEMALE: '女性',
  OTHER: 'その他',
}
