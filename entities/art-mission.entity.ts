export class ArtMissionEntity {
  constructor(
    public id: string,
    public title: string,
    public instruction: string,
    public icon: string,
    public active: boolean,
    public createdAt: string
  ) {}
}
