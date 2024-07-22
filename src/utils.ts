import { Admin, AssignerProtocol, SeekEntry } from "kafkajs";


export const getConsumerGroupInfo = async (admin: Admin, groupIds: any) => {
    console.log(groupIds)
    const groupDescriptions = await admin.describeGroups(groupIds);
    const groupsInfo =  await Promise.all(groupDescriptions.groups.map( async group => {
        let topics = new Set();
        group.members.forEach(member => {
            try{
                const memberAssignment = AssignerProtocol.MemberAssignment.decode(member.memberAssignment);
                Object.keys(memberAssignment).forEach(topic => topics.add(topic));
            } catch (error) {
                console.log('Failed to decode member assignment');
            }
  
        });
  
        if(group.state === 'Empty'){
            const groupOffsets = await admin.fetchOffsets({groupId: group.groupId});
              groupOffsets.map(group => topics.add(group.topic))
            }
        return {
            state: group.state,
            consumerGroupName: group.groupId,
            noOfconsumers: group.members.length,
            topics: Array.from(topics)
        }
    }));
    console.log(groupsInfo);
  
  
  
    return groupsInfo;
  }
  
  export const getConsumerGroupMemberInfo = async (admin: Admin, groupId: string) => {
    const groupDescriptions = await admin.describeGroups([groupId]);
    const topics = new Set();
  
    groupDescriptions.groups[0].members.forEach(member => {
      if (member.memberAssignment.byteLength !== 0) {
        const memberMetadata = AssignerProtocol.MemberMetadata.decode(member.memberAssignment);
        memberMetadata.topics.forEach(topic => topics.add(topic));
      }
    });
  
    const topicArray = Array.from(topics) as string[];
  
    const topicOffsetsInfo = await Promise.all(topicArray.map(topic => admin.fetchTopicOffsets(topic)));
    const groupOffsetsInfo = await admin.fetchOffsets({ groupId: groupId, topics: topicArray });
  
    const topicDetails = {};
    topicArray.forEach((topic: string, index: number) => {
      if (!topicDetails[topic]) {
        topicDetails[topic] = {
          topicOffsets: topicOffsetsInfo[index],
          groupOffsets: groupOffsetsInfo.find(offset => offset.topic === topic)?.partitions || []
        };
      }
    });
    const membersInfo = groupDescriptions.groups[0].members.map(member => {
      const memberId = member.memberId;
      const host = member.clientHost;
      const memberMetadata = AssignerProtocol.MemberMetadata.decode(member.memberMetadata);
      const memberAssignment = AssignerProtocol.MemberAssignment.decode(member.memberAssignment)
      const topic = new Set()
      const partitions = memberAssignment.assignment
      console.log(memberAssignment, memberMetadata)
      const memberInfo = {
        memberId,
        host,
        topics: memberMetadata.topics.map(topic => ({
          topicName: topic,
          meta: []
        }))
      };
  
      memberMetadata.topics.forEach((topic, index) => {
        const { topicOffsets, groupOffsets } = topicDetails[topic];
        const partitionDetails = {};
  
        topicOffsets.forEach((topicOffset) => {
          console.log(topicOffset, memberAssignment.assignment[topic])
          if(memberAssignment.assignment[topic].includes(topicOffset.partition)){
  
          if (!partitionDetails[topicOffset.partition]) {
            partitionDetails[topicOffset.partition] = {};
          }
          partitionDetails[topicOffset.partition].topicCurrentOffset = topicOffset.offset;
          partitionDetails[topicOffset.partition].topicLatestOffset = topicOffset.high;
        }
        });
  
        groupOffsets.forEach((groupOffset) => {
          if(memberAssignment.assignment[topic].includes(groupOffset.partition)){
  
          if (partitionDetails[groupOffset.partition]) {
            partitionDetails[groupOffset.partition].groupCurrentOffset = groupOffset.offset;
          } else {
            partitionDetails[groupOffset.partition] = {
              groupCurrentOffset: groupOffset.offset
            };
          }
        }
        });
  
        memberInfo.topics[index].meta = Object.keys(partitionDetails).map(partition => ({
          partition: Number(partition),
          ...partitionDetails[partition]
        }));
      });
  
      return memberInfo;
    });
  
    return membersInfo;
  };
  
  
  
  export const getConsumerGroupTopics = async (admin: Admin, groupId: string) => {
  
    const topics = new Set();
  
    const groupOffsets = await admin.fetchOffsets({groupId: groupId});
    groupOffsets.map(group => topics.add(group.topic))
  
  
    const topicArray = Array.from(topics) as string[];
    const topicOffsetsInfo = await Promise.all(topicArray.map(topic => admin.fetchTopicOffsets(topic)));
    const groupOffsetsInfo = await admin.fetchOffsets({ groupId: groupId, topics: topicArray });
  
    const topicDetails = {};
  
    topicArray.forEach((topic: string, index: number) => {
      if (!topicDetails[topic]) {
        topicDetails[topic] = {
          topicOffsets: topicOffsetsInfo[index],
          groupOffsets: groupOffsetsInfo.find(offset => offset.topic === topic)?.partitions || []
        };
      }
    });
    
    const topicsInfo = topicArray.map(topic => {
    
      const topicInfo = {
        topics: {
          name: topic,
          meta: []
        }
      };
  
  
        const { topicOffsets, groupOffsets } = topicDetails[topic];
        const partitionDetails = {};
        
        topicOffsets.forEach((topicOffset: { partition: number; offset: string; high: number; low: number }) => {
          if (!partitionDetails[topicOffset.partition]) {
            partitionDetails[topicOffset.partition] = {};
          }
          partitionDetails[topicOffset.partition].topicCurrentOffset = topicOffset.low;
          partitionDetails[topicOffset.partition].topicLatestOffset = topicOffset.high;
        });
  
        groupOffsets.forEach((groupOffset: { partition: number; offset: string; meta: any}) => {
          if (partitionDetails[groupOffset.partition]) {
            partitionDetails[groupOffset.partition].groupCurrentOffset = groupOffset.offset;
          } else {
            partitionDetails[groupOffset.partition] = {
              groupCurrentOffset: groupOffset.offset
            };
          }
        });
        topicInfo.topics.meta = Object.keys(partitionDetails).map(partition => ({
          partition: Number(partition),
          ...partitionDetails[partition]
        }));
  
      return topicInfo;
    });
  
    return topicsInfo;
  };


export const clearTopic = async (admin:Admin, topicName: string, partitions: SeekEntry[], clearType: 'custom_offset' | 'all'): Promise<any> => {
try {

    const topicsOffsets = await admin.fetchTopicOffsets(topicName);
    let partitionsOffset : SeekEntry[]

    if(clearType === 'custom_offset'){
       partitionsOffset = partitions
    } else {
        partitionsOffset = topicsOffsets.map(topicOffset => {
            return {
                partition : topicOffset.partition,
                offset: "-1"
            }
        })
    }
    const {eligiblePartitions, notClearedMessages, clearAllMessages} = filterEligiblePartitions(topicsOffsets, partitionsOffset); 
    if(eligiblePartitions.length > 0) {
    await admin.deleteTopicRecords({
      topic: topicName,
      partitions: partitionsOffset
    });
} else if (clearAllMessages.length > 0){
    await Promise.all(clearAllMessages.map(async partition => {
        await admin.deleteTopicRecords({
            topic: topicName,
            partitions: [partition]
        })
    }))
}
    return {
        eligiblePartitions, notClearedMessages, clearAllMessages
    };
  
} catch (error) {
    console.log(error.message, "yaha eror");
    return false;
}
}


function filterEligiblePartitions(topicOffsets, clientOffsets) {
    const eligiblePartitions = new Set();
    const notClearedMessages = [];
    const clearAllMessages = new Set()

    clientOffsets.forEach(clientOffset => {
      const partitionData = topicOffsets.find(partition => partition.partition === clientOffset.partition);
        const clientOffsetNum = parseInt(clientOffset.offset, 10);
  const lowOffsetNum = parseInt(partitionData.low, 10);
  const highOffsetNum = parseInt(partitionData.high, 10);
  const topicOffset = parseInt(partitionData.offset, 10)
      if (partitionData) {
        if (clientOffsetNum > lowOffsetNum  && clientOffsetNum < highOffsetNum) {
          eligiblePartitions.add(JSON.stringify(clientOffset));
        } else if(highOffsetNum > lowOffsetNum && clientOffset.offset === '-1'){
            clearAllMessages.add(JSON.stringify(clientOffset));
        }else {
          notClearedMessages.push(
            `Partition ${clientOffset.partition} was not cleared. Requested offset ${clientOffset.offset} is outside the range [${partitionData.low}, ${partitionData.high}].`
          );
        }
      } else {
        notClearedMessages.push(`Partition ${clientOffset.partition} does not exist in the topic offsets.`);
      }
    });
  
    return {
      eligiblePartitions: Array.from(eligiblePartitions).map(item => JSON.parse(item as string)),
      notClearedMessages,
      clearAllMessages: Array.from(clearAllMessages).map(item => JSON.parse(item as string))

    };
  }
  