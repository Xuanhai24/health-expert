declare module "animejs" {
  import { AnimeInstance, AnimeParams } from "animejs";
  function anime(params: AnimeParams): AnimeInstance;
  export default anime;
}
