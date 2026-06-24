export class ReadingMissionEntity {
  constructor(
    public id: string,
    public ref: string,
    public text: string,
    public hint: string,
    public verificationQuestion: string,
    public options: string[],
    public correctIndex: number,
    public active: boolean,
    public createdAt: string
  ) {}
}
