import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import "./Event.css";
import { ColonyRole } from "@colony/colony-js";
import { utils } from "ethers";
import Blockies from "react-blockies";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles(theme => ({
    listItem: {
        height: "90px",
        backgroundColor: "white",
        paddingTop: "26px",
        paddingBottom: "26px",
        paddingLeft: "20px",
        paddingRight: "20px",
        borderRadius: "6px",
        "&:hover": {
            backgroundColor: "blue",
          }
      },

  }));
function EventItem(props) {
    //manually coded map for token to token symbol
    const tokenMap = {"0x6B175474E89094C44Da98b954EedeAC495271d0F" : "DAI", "0x0dd7b8f3d1fa88FAbAa8a04A0c7B52FC35D4312c": "BLNY"};
    const classes = useStyles();
    //function for getting readable decimal string from hex nums
    function convertBigNumbers(num, cas) {
        const humanReadableAmount = new utils.BigNumber(num);       

        //different cases for domains or for amounts
        switch (cas) {
            //No division needed if we are looking at domains
            case "Domain":
                return humanReadableAmount.toString();
            default:
                const wei = new utils.BigNumber(10);
                const convertedAmount = humanReadableAmount.div(wei.pow(18));
                return convertedAmount.toString();
        }
       
    }
    //function for creating avatar of size 37 x 37
    function createAvatar(event) {
        switch (event.name) {
 
            case "PayoutClaimed":
                return   <Blockies
                seed= {event.userAddress}
                size={10} 
                scale={3.7} 

              />
            case "ColonyRoleSet":
                return   <Blockies
                seed= {event.values.user}
                size={10} 
                scale={3.7} 
 
              />

            default:
                return   <Blockies
                seed= {event.transactionHash}
                size={10} 
                scale={3.7} 
              />
        }
    }
    //function for rendering primary text in our copy
    function primaryText(event) {
        switch (event.name) {
            case "DomainAdded":
                return <Typography  component='div'>Domain <Box fontWeight={700} component="span">{`${convertBigNumbers(event.values.domainId._hex, "Domain")}`}</Box> added</Typography>;
            case "PayoutClaimed":
                return <Typography component='div' fontWeight={400}>User <Box fontWeight={700} component="span">{`${event.userAddress}`}</Box> claimed   
                <Box fontWeight={700} component="span">{` ${convertBigNumbers(event.values.amount._hex, "Amount")}${tokenMap[event.values.token] ? tokenMap[event.values.token] : event.values.token }`}</Box> payout from pot 
                <Box fontWeight={700} component="span">{` ${convertBigNumbers(event.values.fundingPotId._hex, "Domain")}`}</Box> 
               </Typography>;
            case "ColonyRoleSet":
                return <Typography component='div'><Box fontWeight={700} component="span">{`${ColonyRole[event.values.role]}`}</Box> role assigned to user  
                 <Box fontWeight={700} component="span">{` ${event.values.user}`}</Box> in domain 
                 <Box fontWeight={700} component="span">{` ${convertBigNumbers(event.values.domainId._hex, "Domain")}`}</Box> 
                </Typography>;
            case "ColonyInitialised":
                return "Congratulations! It's a beautiful baby colony!";
            default:
                return "Invalid Name";
        }

    }
    return (
        <ListItem alignItems="center" classes={{root: classes.listItem}}>
            <ListItemAvatar>
          <Avatar>
            {createAvatar(props.data)}
          </Avatar>
        </ListItemAvatar>
          <ListItemText   primary={primaryText(props.data)} 
          secondary={<Typography > {props.data?.date.toLocaleDateString("pt-PT")} </Typography>}
           />
        </ListItem>

    );
}
export default EventItem;