import React from "react";
import { StyleSheet, Linking, View } from "react-native";
import Clipboard from "@react-native-community/clipboard";
import { Body, Card, Text, CardItem, H1, Button } from "native-base";
import { fromUnixTime } from "date-fns";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { OnChainStackParamList } from "./index";
import Blurmodal from "../../components/BlurModal";
import { formatISO, toast } from "../../utils";
import { useStoreState } from "../../state/store";
import { formatBitcoin } from "../../utils/bitcoin-units";
import { constructOnchainExplorerUrl } from "../../utils/onchain-explorer";

interface IMetaDataProps {
  title: string;
  data: string;
}
const MetaData = ({ title, data }: IMetaDataProps) => {
  return (
    <Text
      style={style.detailText}
      onPress={() => {
        Clipboard.setString(data);
        toast("Copied to clipboard.", undefined, "warning");
      }}
    >
      <Text style={{ fontWeight: "bold" }}>{title}:{"\n"}</Text>
      {data}
    </Text>
  );
};

export interface ITransactionDetailsProps {
  navigation: StackNavigationProp<OnChainStackParamList, "OnChainTransactionDetails">;
  route: RouteProp<OnChainStackParamList, "OnChainTransactionDetails">;
}
export default function OnChainTransactionDetails({ navigation, route }: ITransactionDetailsProps) {
  const txId: string = route.params.txId;
  const transaction = useStoreState((store) => store.onChain.getOnChainTransactionByTxId(txId));
  const bitcoinUnit = useStoreState((store) => store.settings.bitcoinUnit);
  const onchainExplorer =  useStoreState((store) => store.settings.onchainExplorer);

  if (!transaction) {
    return (<></>);
  }

  const onPressBlockExplorer = async () => {
    await Linking.openURL(constructOnchainExplorerUrl(onchainExplorer, txId));
  }

  return (
    <Blurmodal>
      <Card style={style.card}>
        <CardItem>
          <Body>
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
              <H1 style={style.header}>
                Transaction
              </H1>
              <Button small={true} onPress={onPressBlockExplorer}>
                <Text style={{ fontSize: 9 }}>See in Block Explorer</Text>
              </Button>
            </View>
            <MetaData title="Id" data={transaction.txHash!} />
            <MetaData title="Date" data={formatISO(fromUnixTime(transaction.timeStamp!.toNumber()))} />
            {transaction.amount && <MetaData title="Amount" data={formatBitcoin(transaction.amount, bitcoinUnit)} />}
            {transaction.totalFees && <MetaData title="Fees" data={transaction.totalFees.toString() + " Satoshi"} />}
            {transaction.label && <MetaData title="Label" data={transaction.label} />}
            <MetaData title="Destination" data={transaction.destAddresses![0]} />
            <MetaData title="Confirmations" data={(transaction.numConfirmations?.toString()) ?? "Unknown"} />
            <MetaData title="Block height" data={(transaction.blockHeight?.toString()) ?? "Unknown"} />
            <MetaData title="Block hash" data={(transaction.blockHash?.toString()) ?? "Unknown"} />
            <Text
              style={style.detailText}
              onPress={() => {
                Clipboard.setString(transaction.rawTxHex?.toString() ?? "Unknown");
                toast("Copied to clipboard.", undefined, "warning");
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Raw tx hex:{"\n"}</Text>
              Press to copy
            </Text>
          </Body>
        </CardItem>
      </Card>
    </Blurmodal>
  );
};

const style = StyleSheet.create({
  card: {
    padding: 5,
    width: "100%",
    minHeight: "55%",
  },
  header: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  detailText: {
    marginBottom: 7,
  },
});
