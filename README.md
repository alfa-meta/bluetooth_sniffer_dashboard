## Things to do

0. Make tshark output json and pcap files:
    Use 1 thread for pcap
    Use 1 thread for json
    Use 1 thread to check time

Correct tshark command:
    tshark -i COM5-4.4 -T json > output.json