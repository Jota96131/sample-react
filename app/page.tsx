import axios from "axios";

type QiitaResponse = {
  id: string;
  title: string;
  url: string;
  image: string;
};

export default async function Home() {
  const getQiitaItems = async () => {
    const response = await axios.get<QiitaResponse[]>(
      "https://qiita.com/api/v2/items?query=user:Sicut_study&per_page=4",
      {
        headers: {
          Authorization: `Bearer ${process.env.QIITA_API_KEY}`,
        },
      },
    );
    return response.data;
  };

  const qiitaItems = await getQiitaItems();

  return (
    <div>
      <h1>Topページ</h1>
      <ul>
        {qiitaItems.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}
