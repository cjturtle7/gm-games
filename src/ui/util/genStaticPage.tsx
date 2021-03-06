import type React from "react";
import useTitleBar from "../hooks/useTitleBar";
import initView from "./initView";

const genStaticPage = (
	name: string,
	title: string,
	content: React.ReactNode,
	inLeague: boolean,
) => {
	return initView({
		id: name,
		inLeague,
		Component: () => {
			useTitleBar({
				title,
			});
			return content;
		},
	});
};

export default genStaticPage;
