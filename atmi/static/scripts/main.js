import React from 'react'
import {render} from 'react-dom'
import MainPanel from "./components/MainPanel.js"
import MainNav from "./components/MainNav.js"


class MainPage extends React.Component {

    constructor(props) {
        super(props);

        let imageIds = [];
        if(data.series_detail["series_files_list"] === undefined){
            alert("Couldn't find series files. Maybe your url contains illegal instance/study/series id...");
            return;
        }
        for (let i of data.series_detail["series_files_list"]) {
            imageIds.push("wadouri:/dcm" + data.series_detail['series_path'].substring(1)+"/" + i)
        }

        this.state = {
            instanceId: data.instance_id,
            studyId: data.study_id,
            seriesId: data.series_id,
            studyPath: data.study_path,
            labels: data.label_candidates,
            imageIds: imageIds,
            currentImageIdIndex: 0,
            currentTool: "Wwwc",
            currentLabel: -1
        };
    }

    render() {
        return (
            <div>
                <MainNav stack={{...this.state}} onUpdateTool={this.handleUpdate}/>
                <MainPanel stack={{...this.state}}/>
            </div>
        )
    }

}

const App = () => (
        <MainPage/>
);
render(<App/>,
    document.getElementById('root')
);
