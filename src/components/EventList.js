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
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const classes = useStyles();
    useEffect(() => {
        const loadEvents = async () => {
            //initialize our loading and error catching events
            setIsLoading(true);
            setHasError(false);
            try {
            //set up our colony client and filters
            const colonyClient = await getColonyClient();
            const roleSetFilter = colonyClient.filters.ColonyRoleSet();
            const initializedFilter = colonyClient.filters.ColonyInitialised();
            const payoutClaimedFilter = colonyClient.filters.PayoutClaimed();
            const domainAddedFilter = colonyClient.filters.DomainAdded();
            const filters = [roleSetFilter, initializedFilter, payoutClaimedFilter, domainAddedFilter];
            //temp event data
            let eventData = [];
            for (let i = 0; i < filters.length; i++) {
                //get raw and parsed logs for each event filter
                const rawLogs = await getLogs(colonyClient, filters[i]);
                const parsedLogs = rawLogs.map(event => colonyClient.interface.parseLog(event));
                //combine them into one object
                for (let j = 0; j < rawLogs.length; j++) {
                    let mergedLog = { ...rawLogs[j], ...parsedLogs[j] };
                    //get date data
                    const logTime = await getBlockTime(provider, mergedLog.blockHash);
                    mergedLog["date"] = new Date(logTime);
                    //if we are in payout case, get the address
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
            //sort by date in descending order(most recent first)
            eventData.sort((a, b) => b.date - a.date);
            setEvents(eventData);
        }
        catch {
            //we encountered an error, display it to user
            setHasError(true);
        }
            //we are done loading data
            setIsLoading(false);

        };
        loadEvents();
    }, [setEvents])
    return (

        <div >
            {hasError ? <p>Error encountered in parsing events, please try again</p> : <p></p>}
            {isLoading ? <p>Loading Events Data. Please wait</p> :
            <Grid container direction="column" alignItems="center" justifyContent="center">
        <List className={classes.root}>
            {events.map(event => (
                <div>
                <EventItem key={`${event.transactionHash}-${event.logIndex}`} data={event}></EventItem>
                <Divider variant="inset" component="li" />
                </div>
            ))}
        </List>
        </Grid>
}
        </div>
    );
}
export default EventList;