import { GeoLocation } from './GeoSpatial.js';

/**
 * Scene metadata interface
 * Each scene represents a NeRF capture with its location and narrative context
 */
export interface SceneMetadata {
  id: string;
  title: string;
  url: string;
  location: GeoLocation;
  description?: string;
  captureDate?: string;
  tags?: string[];
}

/**
 * Local narrative scene database
 * All scene metadata is stored here - no external API calls needed
 *
 * Complete collection of NeRF captures dynamically loaded on startup
 */
export const NARRATIVE_SCENES: SceneMetadata[] = [
  { id: "brc2010", title: "BRC2010", url: "https://lumalabs.ai/capture/94af1531-42b8-40d2-8a93-4de2400bfd3f", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of BRC2010", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "orange-burger", title: "Orange burger", url: "https://lumalabs.ai/capture/e2ff62ba-45c5-4ecd-b3d6-8cdf3e573d1a", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Orange burger", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "art-hotel", title: "Art hotel", url: "https://lumalabs.ai/capture/d4f9fc1b-adf7-457a-84f4-6e58ade320bb", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Art hotel", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "rpd", title: "RPD", url: "https://lumalabs.ai/capture/a618d496-ace5-4038-9e34-a75325c71c62", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of RPD", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "hallway-sasha", title: "Hallway Sasha", url: "https://lumalabs.ai/capture/478836ff-cf7a-432e-bf90-05847d58433d", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Hallway Sasha", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "budapesterstrasse", title: "Budapesterstrasse", url: "https://lumalabs.ai/capture/a007afba-f368-41fd-80d0-0430d065d0fa", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Budapesterstrasse", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "lalos-lare-byebye", title: "Lalo's Lare Byebye", url: "https://lumalabs.ai/capture/d06239f6-8a93-45d5-892d-37ae986be06e", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Lalo's Lare Byebye", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "jojos-lare", title: "Jojo's Lare", url: "https://lumalabs.ai/capture/71eae6cf-07ff-4b9a-92b7-b0ccdedc5f48", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Jojo's Lare", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "home-2", title: "Home 2", url: "https://lumalabs.ai/capture/306325dc-9dfa-4f77-8894-75bda409791b", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Home 2", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "homesweethome", title: "HomeSweetHome", url: "https://lumalabs.ai/capture/e9df6795-ed43-4472-b624-089741f20cdb", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of HomeSweetHome", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "eden", title: "Eden", url: "https://lumalabs.ai/capture/61f5546e-bfd1-420b-b28a-cd3d883f01e8", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Eden", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "code-heart", title: "Code ❤️", url: "https://lumalabs.ai/capture/ec750d17-4b49-4f0f-b8c1-44160ea70194", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Code ❤️", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "code", title: "Code", url: "https://lumalabs.ai/capture/ebd13597-28cd-4311-94d7-eed25dc24435", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Code", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "rafa-airbnb", title: "Rafa airbnb", url: "https://lumalabs.ai/capture/d8cf23ca-4422-4441-9b13-e4f909ca7c21", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Rafa airbnb", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "marcello", title: "Marcello", url: "https://lumalabs.ai/capture/33eaef70-448b-4832-b5c8-4461ac071028", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Marcello", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "lars", title: "Lars", url: "https://lumalabs.ai/capture/d8be6d2d-50e8-4ec2-bee2-eb2c909afae5", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Lars", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "meeting-time", title: "Meeting time", url: "https://lumalabs.ai/capture/a6c9405c-243b-4247-bc2e-1350c2af1a48", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Meeting time", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "hydrogen", title: "Hydrogen", url: "https://lumalabs.ai/capture/fe393332-cb97-4331-a47d-0cef0ac582ba", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Hydrogen", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "facetas", title: "Facetas", url: "https://lumalabs.ai/capture/4f048b9e-2a4c-47f1-a3ab-a93547863b5b", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Facetas", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "convergencia", title: "Convergencia", url: "https://lumalabs.ai/capture/7d700819-33ab-4ae8-8612-8adeb7874ced", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Convergencia", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "kalt-party", title: "Kalt Party", url: "https://lumalabs.ai/capture/f840afc4-dcb1-42aa-aadb-83773ee20571", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Kalt Party", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "snow-edition", title: "Snow edition", url: "https://lumalabs.ai/capture/cc6e2b15-34e2-4172-aa0a-63b34334aa50", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Snow edition", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "seatsnow", title: "Seatsnow", url: "https://lumalabs.ai/capture/183e19d1-5b67-4242-b817-7a93fb388c63", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Seatsnow", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "tea-time", title: "Tea time", url: "https://lumalabs.ai/capture/cd059bb9-092b-454e-9f6b-9b10c15409cc", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Tea time", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "r518", title: "R518", url: "https://lumalabs.ai/capture/be16c5aa-187d-418e-8833-a6f08b8536b5", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of R518", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "monkeykuddam", title: "MonkeyKuddam", url: "https://lumalabs.ai/capture/28c11afe-9ed3-441d-bcfc-67a3948f1e32", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of MonkeyKuddam", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "k216", title: "K216", url: "https://lumalabs.ai/capture/f560f41a-c874-4bc0-8603-0b9ed43b0e6c", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of K216", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "workroom", title: "WorkRoom", url: "https://lumalabs.ai/capture/32ecc001-98c1-47c4-8a6b-974ca7827d19", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of WorkRoom", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "code-entrance", title: "Code Entrance", url: "https://lumalabs.ai/capture/9fe27138-fd23-42b9-9bf9-77c877c0d569", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Code Entrance", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "code-20", title: "CODE 2.0", url: "https://lumalabs.ai/capture/432ca7dc-679c-47a2-b377-9bcda68f3199", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of CODE 2.0", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "home-30", title: "Home_3.0", url: "https://lumalabs.ai/capture/7e314098-f269-45b2-858f-f9482e958616", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Home_3.0", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "super", title: "Super", url: "https://lumalabs.ai/capture/e00b22ec-886e-4f61-96f7-1bc54c0e91bf", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Super", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "prexmas", title: "PreXmas", url: "https://lumalabs.ai/capture/bbd1e8b9-0d9b-414d-8286-4ae57b69c62e", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of PreXmas", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "circ", title: "Circ", url: "https://lumalabs.ai/capture/05ee2787-8e3a-4aaa-99f4-9f32beff9e6e", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Circ", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "2nd-try", title: "2nd try", url: "https://lumalabs.ai/capture/a9151b2d-431f-4e4d-97fe-91b300e1af7d", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of 2nd try", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "printz", title: "Printz", url: "https://lumalabs.ai/capture/c4a56fbd-41c1-4ae3-9cfc-86287a397a28", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Printz", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "klein-raum", title: "Klein Raum", url: "https://lumalabs.ai/capture/428a68f5-0ba8-4b3d-ac15-c9e856a7d280", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Klein Raum", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "workspace", title: "Workspace", url: "https://lumalabs.ai/capture/6440ad44-9f26-47d5-9352-a1a11ead544f", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Workspace", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "merry-xmas", title: "Merry Xmas", url: "https://lumalabs.ai/capture/4424878b-0f6e-4586-b0ae-42ce40e2fa40", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Merry Xmas", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "numa", title: "Numa", url: "https://lumalabs.ai/capture/b906cec7-29cb-4a15-909f-2441df5a52fe", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Numa", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "schonenbear", title: "SchonenBear", url: "https://lumalabs.ai/capture/fc3e1a6c-f208-4f70-a782-e72a415bdf94", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of SchonenBear", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "schonenberg", title: "Schonenberg", url: "https://lumalabs.ai/capture/bfbdc6ea-931f-44ce-9904-5b68064579f3", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Schonenberg", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "back-in-berlin", title: "Back in Berlin", url: "https://lumalabs.ai/capture/9a812f2a-4215-4ceb-a3df-df4fbd5b6a07", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Back in Berlin", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "menina-bull", title: "Menina bull", url: "https://lumalabs.ai/capture/820e2958-91d4-4bb4-a146-7262f3da6bec", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Menina bull", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "i-need-a-hero", title: "I need a hero", url: "https://lumalabs.ai/capture/21c8e22f-2823-42a5-a9fe-bf3ca212c35b", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of I need a hero", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "cow-004", title: "Cow_004", url: "https://lumalabs.ai/capture/78f8f0f9-aeed-443e-bcc1-a6b44be769b6", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Cow_004", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "mercado-de-barcelo", title: "Mercado de Barcelo", url: "https://lumalabs.ai/capture/786aaf8b-ff56-44cd-8901-93da42d53e9e", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Mercado de Barcelo", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "night-park", title: "Night Park", url: "https://lumalabs.ai/capture/18a142f1-e81f-49d2-a8b5-55ca3fb4ed98", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Night Park", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "cow003", title: "Cow003", url: "https://lumalabs.ai/capture/6113c57b-1fd8-4627-8b76-0538613fe64e", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of Cow003", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "cow-002", title: "COW-002", url: "https://lumalabs.ai/capture/96294573-08b6-4ee4-ae7a-1c344c78ba27", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of COW-002", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "cow-002", title: "COW-002", url: "https://lumalabs.ai/capture/96294573-08b6-4ee4-ae7a-1c344c78ba27", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of COW-002", captureDate: "2024-03-15", tags: ["nature", "urban"] },
  { id: "cow-002", title: "COW-002", url: "https://lumalabs.ai/capture/1d03da7e-8b2c-4a43-9983-1282a9bb23a0", location: { latitude: 40.4155, longitude: -3.7074, altitude: 650 }, description: "A beautiful capture of COW-002", captureDate: "2024-03-15", tags: ["Numa", "urban"] }
];

/**
 * Helper function to get a scene by ID
 */
export function getSceneById(id: string): SceneMetadata | undefined {
  return NARRATIVE_SCENES.find(scene => scene.id === id);
}

/**
 * Helper function to get a scene by index
 */
export function getSceneByIndex(index: number): SceneMetadata | undefined {
  return NARRATIVE_SCENES[index];
}

/**
 * Get total number of scenes
 */
export function getSceneCount(): number {
  return NARRATIVE_SCENES.length;
}
