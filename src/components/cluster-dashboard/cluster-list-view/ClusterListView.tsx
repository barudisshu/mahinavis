import React, { Fragment, useEffect } from "react";
import { Grid, Button, Tooltip, TextField, Fab, IconButton } from "@material-ui/core";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import {
  FiberManualRecord as FiberManualRecordIcon,
  Add as AddIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowRight as ArrowRightIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon
} from "@material-ui/icons";
import { useSelector, useDispatch } from "react-redux";

import "./ClusterListView.scss";
import ConfirmationDialog from "../../shared/confirmation-dialog/ConfirmationDialog";
import {
  addClusterNode,
  openConfirmationDialog,
  leaveDownClusterNode
} from "../../../actions/dash";
import { ClusterDashboardState } from "../../../reducers/dash";

const ClusterListView: React.FC = () => {
  const cluster = useSelector(
    (state: { dashboard: ClusterDashboardState }) => state.dashboard.cluster);
  const confirmationDialog = useSelector(
    (state: { dashboard: ClusterDashboardState }) => state.dashboard.confirmationDialog);
  const dispatch = useDispatch();
  const [addNodeAddress, setAddNodeAddress] = React.useState("");
  const [expanded, setExpanded] = React.useState(true);
  const [expandedViewNodes, setExpandedViewNodes] = React.useState<string[]>([]);

  const handleMember = (member: string, mode: string): void => {
    const title = mode.toLowerCase() === "leave"
      ? "Remove Node From Cluster?"
      : "Shutdown Node in Cluster?";
    const content = mode.toLowerCase() === "leave"
      ? `Are you sure you want to remove node ${member} from the cluster?`
      : `Are you sure you want to shutdown node ${member} in the cluster?`;
    const data = { member, mode };
    dispatch(openConfirmationDialog(title, content, data));
  };

  const addMember = (): void => {
    if (!addNodeAddress || addNodeAddress.trim() === "") {
      return;
    }
    dispatch(addClusterNode(addNodeAddress));
  };

  const handleMemberConfirm = ({ member, mode }: { member: string; mode: string }): void => {
    dispatch(leaveDownClusterNode(member, mode));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeToggle = (event: any, nodeIds: string[]): void => {
    setExpandedViewNodes(nodeIds);
  };

  useEffect(() => {
    if (expanded) {
      if (cluster && cluster.members && cluster.members.length) {
        const nodeIds = cluster.members.map((member) => member.nodeUid);
        setExpandedViewNodes(nodeIds);
      }
      else { setExpandedViewNodes([]); }
    }
    else {
      setExpandedViewNodes([]);
    }
    // eslint-disable-next-line
  }, [expanded]);

  return (
    <Fragment>
      <Grid item={true} xs={3}
        className="home-left-container pos-rel">
        <div className="member-list-container">
          <div className="member-list-container-title">
            <span>CLUSTER NODES</span>
            <div className="member-list-tools">
              {
                !expanded &&
                <IconButton size="small"
                  onClick={(): void => setExpanded(true)}
                >
                  <Tooltip title="Expand All" placement="bottom">
                    <ArrowDownwardIcon />
                  </Tooltip>
                </IconButton>
              }
              {
                expanded &&
                <IconButton size="small"
                  onClick={(): void => setExpanded(false)}
                >
                  <Tooltip title="Collapse All" placement="bottom">
                    <ArrowUpwardIcon />
                  </Tooltip>
                </IconButton>
              }
            </div>
          </div>
          <TreeView
            className="member-tree-view"
            defaultCollapseIcon={<ArrowDropDownIcon />}
            defaultExpandIcon={<ArrowRightIcon />}
            expanded={expandedViewNodes}
            onNodeToggle={handleNodeToggle}
          >
            {cluster &&
              cluster.members &&
              cluster.members.map((member, index) => {
                return (
                  <TreeItem
                    key={member.nodeUid}
                    nodeId={member.nodeUid}
                    label={
                      <div className="member-header">
                        <span className="disp-inline-blk">
                          <FiberManualRecordIcon
                            className={`member-status ${member.status.toLowerCase()}`}
                          />
                        </span>
                        <Tooltip title={member.node} placement="bottom">
                          <span className="member-name disp-inline-blk">
                            {member.node.split("://")[1]}
                          </span>
                        </Tooltip>
                        {member.node === cluster.leader && (
                          <Tooltip title="Leader Node" placement="bottom">
                            <span className="member-type disp-inline-blk leader">
                              L
                            </span>
                          </Tooltip>
                        )}
                        {member.node === cluster.oldest && (
                          <Tooltip title="Oldest Node" placement="bottom">
                            <span className="member-type disp-inline-blk oldest">
                              O
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    }
                  >
                    <TreeItem
                      nodeId={`${index}child`}
                      label={
                        <div className="member-details">
                          <div>
                            <span className="font-bold">node : </span>
                            <span>{member.node}</span>
                          </div>
                          <div>
                            <span className="font-bold">nodeUid : </span>
                            <span>{member.nodeUid}</span>
                          </div>
                          <div>
                            <span className="font-bold">status : </span>
                            <span>{member.status.toLowerCase()}</span>
                          </div>
                          <div>
                            <span className="font-bold">roles : </span>
                            <span>{member.roles.join(",")}</span>
                          </div>
                          <div className="member-actions">
                            <Button
                              variant="contained"
                              size="small"
                              onClick={(): void =>
                                handleMember(member.node, "Leave")
                              }
                            >
                              LEAVE
                            </Button>
                            <Button
                              className="themed"
                              variant="contained"
                              size="small"
                              onClick={(): void =>
                                handleMember(member.node, "Down")
                              }
                            >
                              SHUTDOWN
                            </Button>
                          </div>
                        </div>
                      }
                    />
                  </TreeItem>
                );
              })}
          </TreeView>
        </div>
        <div className="add-member-container">
          <TextField
            value={addNodeAddress}
            onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
              setAddNodeAddress(event.currentTarget.value);
            }}
            label="Node Address"
            placeholder="Enter Node Address"
            margin="dense"
            variant="outlined"
            fullWidth={true}
          />
          <Tooltip title="Add Node" placement="bottom">
            <Fab
              variant="extended"
              size="small"
              aria-label="add node address"
              onClick={(): void => addMember()}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </div>
      </Grid>
      <ConfirmationDialog
        title={confirmationDialog.title}
        content={confirmationDialog.content}
        open={confirmationDialog.open}
        handleAgree={handleMemberConfirm}
        data={confirmationDialog.data}
      />
    </Fragment>
  );
};

export default ClusterListView;
