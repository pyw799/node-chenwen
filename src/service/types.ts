/* eslint-disable */
// @ts-ignore

export type ApiResponse = {
  code?: number
  type?: string
  message?: string
}

export type Category = {
  id?: number
  name?: string
}

export type Order = {
  id?: number
  petId?: number
  quantity?: number
  shipDate?: string
  /** Order Status */
  status?: 'placed' | 'approved' | 'delivered'
  complete?: boolean
}

export type Pet = {
  id?: number
  category?: Category
  name: string
  photoUrls: string[]
  tags?: Tag[]
  /** pet status in the store */
  status?: 'available' | 'pending' | 'sold'
}

export type petFindByStatusUsingGetParams = {
  /** Status values that need to be considered for filter */
  status: ('available' | 'pending' | 'sold')[]
}

export type petFindByTagsUsingGetParams = {
  /** Tags to filter by */
  tags: string[]
}

export type PetPetIdUploadImageUsingPostBody = {
  /** Additional data to pass to server */
  additionalMetadata?: string
  /** file to upload */
  file?: string
}

export type petPetIdUploadImageUsingPostParams = {
  /** ID of pet to update */
  petId: number
}

export type petPetIdUsingDeleteParams = {
  /** Pet id to delete */
  petId: number
}

export type petPetIdUsingGetParams = {
  /** ID of pet to return */
  petId: number
}

export type PetPetIdUsingPostBody = {
  /** Updated name of the pet */
  name?: string
  /** Updated status of the pet */
  status?: string
}

export type petPetIdUsingPostParams = {
  /** ID of pet that needs to be updated */
  petId: number
}

export enum StatusEnum {
  'available' = 'available',
  'pending' = 'pending',
  'sold' = 'sold',
}

export type IStatusEnum = keyof typeof StatusEnum

export enum StatusEnum2 {
  'placed' = 'placed',
  'approved' = 'approved',
  'delivered' = 'delivered',
}

export type IStatusEnum2 = keyof typeof StatusEnum2

export type storeOrderOrderIdUsingDeleteParams = {
  /** ID of the order that needs to be deleted */
  orderId: number
}

export type storeOrderOrderIdUsingGetParams = {
  /** ID of pet that needs to be fetched */
  orderId: number
}

export type Tag = {
  id?: number
  name?: string
}

export type User = {
  id?: number
  username?: string
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  phone?: string
  /** User Status */
  userStatus?: number
}

export interface ILoginBody {
  msgCode: string
  phoneNum: string
}
export type ISmsCodeBody = {
  phoneNum: string
}

export type UserCreateWithArrayUsingPostBody = User[]

export type UserCreateWithListUsingPostBody = User[]

export type userLoginUsingGetParams = {
  /** The user name for login */
  username: string
  /** The password for login in clear text */
  password: string
}

export type userUsernameUsingDeleteParams = {
  /** The name that needs to be deleted */
  username: string
}

export type userUsernameUsingGetParams = {
  /** The name that needs to be fetched. Use user1 for testing.  */
  username: string
}

export type userDictGetParams = {
  /** The name that needs to be fetched. Use user1 for testing.  */
  dictType: string
  pageNum: number
  pageSize: number
}

export type userUsernameUsingPutParams = {
  /** name that need to be updated */
  username: string
}

export type getPageParams = {
  pageNum: number
  pageSize: number
  processKey?: string
  actStatus?: string
}

export interface SubmissionProject {
  id?: number
  workType?: string
  projectType?: string
  projectName?: string
  projectTarget?: string
  solution?: string
  fileInfoList?: FileItem[]
}

export interface FileItem {
  id?: number
  fileName?: string
  filePath?: string
  fileSize?: number
}

// 最多报一次流程上报相关类型
export interface LastReportProcess {
  id?: number
  createBy?: string
  phone?: string
  deptName?: string
  problem?: string
  passCode?: string
  comment?: string
  feedback?: string
  createId?: string
  workStatus?: string
  processKey?: string
  taskId?: string
  isSubmit?: string
  createTime?: string
  updateTime?: string
}

export type LastReportProcessParams = {
  pageNum?: number
  pageSize?: number
  processKey?: string
}

export type orderProcessListParams = {
  pageNum?: number
  pageSize?: number
}
