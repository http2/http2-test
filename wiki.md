# Sample framing scenarios

1. DATA Frame
1.1 Client sends request to server, server validate format of DATA frame received:
    - Reserved bit = 0
    - Length = Length of frame payload
    - Frame Type = 0x0
    - Flag = 0x0 or END_STREAM (0x1)
    - Stream ID = non-zero and odd number


1.2 Server sends DATA frame with length shorter than length of data, validate client responds with FRAME_SIZE_ERROR error




2. PRIORITY Frame
2.1 Client sends PRIORITY frame to server, server validate format of PRIORITY frame received:
    - Reserved bit = 0
    - Length = Length of frame payload
    - Frame Type = 0x2
    - No flag defined
    - Single reserved bit in payload
    - Stream ID = non-zero and odd number
    - Priority value is within range (0 to 2^31-1)
    
2.2 Server sends PRIORITY frame with stream identifier of 0x0, validate client responds with a connection error type PROTOCOL_ERROR

