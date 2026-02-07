export interface ApiResponseDataList<T> {
  dataList: T[];
  success: boolean;
  message: string;
  total: number;
}


export interface ApiResponseData<T> {
  data: T;
  success: boolean;
  status: number;
  message: string;
  errorCode: string;
}