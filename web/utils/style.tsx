export const recommendations = [
  {
    title: "Send yourself\na direct message\nevery day\nat 10AM",
    subTitle: "Click here to create it now!",
    color: "bg-pink-400",
    totu: [
      "1. For the action, choose the service date_and_time",
      "2. Select the action nammed Daily Trigger and configure it",
      "3. Then, for the reaction choose the Discord service.",
      "4. Select the action nammed Send Direct Message",
      "Finally, submit and save your new .......... AREA. ",
    ],
  },
  {
    title: "Update your\nloved ones\nwhen you create\na new playlist",
    subTitle: "Click here to create it now!",
    color: "bg-blue-500",
    totu: [
      "1. For the action, choose the service Spotify",
      "2. Select the action nammed Send an email",
      "3. Then, for the reaction choose the Spotify service.",
      "4. Select the action nammed New Service",
      "Finally, submit and save your new .......... AREA. ",
    ],
  },
  {
    title: "Update your\nGitHub bio when\nnew follower",
    subTitle: "Click here to create it now!",
    color: "bg-orange-400",
    totu: [
      "1. For the action, choose the service Spotify",
      "2. Select the action nammed New Follower",
      "3. Then, for the reaction choose the Github service.",
      "4. Select the action nammed Update Bio",
      "Finally, submit and save your new .......... AREA. ",
    ],
  },
];

export function splitIntoLines(text: string) {
  const words = text.split(" ");
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += 2)
    lines.push(words.slice(i, i + 2).join(" "));
  return lines;
}
