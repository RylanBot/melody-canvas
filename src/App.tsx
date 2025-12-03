import { merge } from "lodash-es";
import { ConfigProvider } from "tdesign-react";
import enConfig from "tdesign-react/es/locale/en_US";

import { AudioControls } from "@/components/audio";
import { CanvasPreview, SideNav, TopNav } from "@/components/layout";

function App() {
  const globalConfig = merge(enConfig, {
    input: {
      placeholder: ""
    },
    select: {
      placeholder: ""
    }
  });

  return (
    <>
      <ConfigProvider globalConfig={globalConfig}>
        <TopNav />
        <SideNav />
        <CanvasPreview />
        <AudioControls />
      </ConfigProvider>
    </>
  );
}

export default App;
