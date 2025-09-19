declare global {
 interface Response{
  id:string,
  sessionName:string,
  query:{
    userquery:string
    createdAt:string,
    fileLink:string|null, }
  response:{ id:number,
  llmResponse:string
  }[],
}

}
// This line is required for global augmentation to work
export {};