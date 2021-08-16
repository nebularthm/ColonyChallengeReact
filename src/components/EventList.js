import React, { useState, useEffect } from "react";
import { getLogs } from "@colony/colony-js";
import { getColonyClient, provider } from "../DataStore"
import { utils } from "ethers";
import { getBlockTime } from "@colony/colony-js";
import EventItem from "./EventItem";
import List from "@material-ui/core/List";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
const useStyles = makeStyles(theme => ({
    root: {
        width: "700px",
        backgroundColor: theme.palette.background.paper,
        height: "auto",
        boxShadow: "rgba(62, 118, 244, 0.14)"
      },
      inline: {
        display: "inline",
      }
  }))
function EventList(props) {
    const [events, setEvents] = useState([]);
    const classes = useStyles();
    useEffect(() => {
        (async () => {
            const colonyClient = await getColonyClient()
            const roleSetFilter = colonyClient.filters.ColonyRoleSet();
            const initializedFilter = colonyClient.filters.ColonyInitialised();
            const payoutClaimedFilter = colonyClient.filters.PayoutClaimed();
            const domainAddedFilter = colonyClient.filters.DomainAdded();
            const filters = [roleSetFilter, initializedFilter, payoutClaimedFilter, domainAddedFilter]
            let eventData = []
            for (let i = 0; i < filters.length; i++) {
                //get raw and parsed logs for each event filter
                const rawLogs = await getLogs(colonyClient, filters[i]);
                const parsedLogs = rawLogs.map(event => colonyClient.interface.parseLog(event));
                //combine them into one object
                for (let j = 0; j < rawLogs.length; j++) {
                    let mergedLog = { ...rawLogs[j], ...parsedLogs[j] };
                    const logTime = await getBlockTime(provider, mergedLog.blockHash);
                    mergedLog["date"] = new Date(logTime);
                    if (mergedLog.name === "PayoutClaimed") {
                        const humanReadableFundingPotId = new utils.BigNumber(
                            mergedLog.values.fundingPotId
                        ).toString();

                        const {
                            associatedTypeId,
                        } = await colonyClient.getFundingPot(humanReadableFundingPotId);

                        const userAddress = await colonyClient.getPayment(associatedTypeId);
                        mergedLog["userAddress"] = userAddress.recipient;
                    }
                    eventData.push(mergedLog);
                }
            }
            eventData.sort((a, b) => b.date - a.date);
            setEvents(eventData);

        })()

    }, [])
    return (
        <div >
            <Grid container direction="column" alignItems="center" justify="center">
        <List className={classes.root}>
            {events.map(event => (
                <div>
                <EventItem key={`${event.transactionHash}-${event.logIndex}`} data={event}></EventItem>
                <Divider variant="inset" component="li" />
                </div>
            ))}
        </List>
        </Grid>
        </div>
    );
}
export default EventList;